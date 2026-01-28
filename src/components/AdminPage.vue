<script>
import AdminApiMixine from '../mixins/AdminApiMixine'
import TimetableApiMixine from '../mixins/TimetableApiMixine';

export default{
    data(){
        return {
            parseRequest:{
                login: "",
                password: "",
                forceUpdate: false,
                ignoreDownload: false
            },
            startFirstWeek:Date,
            // Данные для отображения статуса
            parsingStatus: null,
            timerId: null,
            // Маппинг состояний (Enum из Swagger: 0, 1, 2, 3)
            parsingStates: {
                0: { text: "Ожидание", class: "text-secondary", badge: "bg-secondary" },
                1: { text: "В процессе", class: "text-primary", badge: "bg-primary" },
                2: { text: "Завершено успешно", class: "text-success", badge: "bg-success" },
                3: { text: "Ошибка", class: "text-danger", badge: "bg-danger" }
            }
        }
    },
    mixins:[
        AdminApiMixine,
        TimetableApiMixine
    ],
    methods:{
        async IniciateParsing(){
            if(!confirm(`Вы уверены что вы хотите начать парсинг/выгрузку?`))
                return
            
            // Сбрасываем текущий статус перед новым запуском
            this.parsingStatus = null;

            var res = await this.StartParsing(
                this.parseRequest.login, 
                this.parseRequest.password, 
                this.parseRequest.ignoreDownload, 
                this.parseRequest.forceUpdate
            )

            if(res.code == 200 || res.code == 202){
                // Запускаем опрос статуса сразу после старта
                this.startPolling();
            } else {
                alert("Не удалось запустить парсинг: " + (res.text || res.code));
            }
        },
        async fetchStatus() {
            var res = await this.GetParsingStatus();
            if(res.code == 200) {
                this.parsingStatus = res.body;
                
                // Автоскролл логов вниз
                this.$nextTick(() => {
                    const logContainer = this.$refs.logContainer;
                    if(logContainer) {
                        logContainer.scrollTop = logContainer.scrollHeight;
                    }
                });

                // Если статус 1 (В процессе), продолжаем опрос.
                // Если нет (0, 2, 3) - останавливаем, если таймер запущен.
                if (this.parsingStatus.state !== 1 && this.timerId) {
                    this.stopPolling();
                } else if (this.parsingStatus.state === 1 && !this.timerId) {
                    // Если вдруг зашли на страницу, а там уже идет парсинг
                    this.startPolling(); 
                }
            }

            res = await this.GetFirstWeeekAsync()
            if(res.code == 200){
                this.startFirstWeek = res.body;
            }
        },
        startPolling() {
            // Чтобы не плодить таймеры
            if(this.timerId) return;
            
            this.fetchStatus(); // Первый вызов сразу
            this.timerId = setInterval(() => {
                this.fetchStatus();
            }, 2000); // Опрос каждые 2 секунды
        },
        stopPolling() {
            if (this.timerId) {
                clearInterval(this.timerId);
                this.timerId = null;
            }
        },
        formatDate(dateStr) {
            if (!dateStr) return "-";
            return new Date(dateStr).toLocaleString("ru-RU");
        },
        async UpdateSettings(){
            await this.SetFirstWeek(this.startFirstWeek);

            await this.fetchStatus()
        }
    },
    mounted() {
        // При загрузке страницы проверяем, вдруг парсинг уже идет
        this.fetchStatus();
    },
    unmounted() {
        // Обязательно чистим таймер при уходе со страницы
        this.stopPolling();
    }
}
</script>

<template>
    <div class="d-flex flex-column container mt-3">
        <!-- Блок запуска -->
        <div class="d-flex w-100 align-items-center mb-3">
            <hr class="hr flex-grow-0 me-2" style="width: 5%;"/>
            <span class="text-nowrap fw-bold fs-5">Управление выгрузкой</span>
            <hr class="hr flex-grow-1 ms-2" />
        </div>

        <form 
            ref="form"
            class="mb-3 d-flex flex-column flex-lg-row align-items-center justify-content-center p-3 panel border-light bg-light" 
            style="gap: 1rem;"
        >
            <div class="d-flex flex-column">
                <label class="form-label text-muted small mb-1">Логин LMS</label>
                <input type="text" class="form-control" v-model="this.parseRequest.login" placeholder="User"/>
            </div>
            
            <div class="d-flex flex-column">
                <label class="form-label text-muted small mb-1">Пароль LMS</label>
                <input type="password" class="form-control" v-model="this.parseRequest.password" placeholder="***"/>
            </div>

            <div class="d-flex flex-column justify-content-center">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" v-model="this.parseRequest.forceUpdate"/>
                    <label class="form-check-label small">Force Update</label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" v-model="this.parseRequest.ignoreDownload"/>
                    <label class="form-check-label small">Игнорировать загрузку файлов</label>
                </div>
            </div>
                        
            <button 
                type="button" 
                class="btn btn-primary h-100 align-self-end mb-1"
                @click="this.IniciateParsing"
                :disabled="parsingStatus && parsingStatus.state === 1"
            >
                <span v-if="parsingStatus && parsingStatus.state === 1" class="spinner-border spinner-border-sm me-1"></span>
                {{ parsingStatus && parsingStatus.state === 1 ? 'Работаю...' : 'Запустить' }}
            </button>                                
        </form>

        <form 
            ref="formSettings"
            class="mb-3 d-flex flex-column flex-lg-row align-items-center justify-content-center p-3 panel border-light bg-light" 
            style="gap: 1rem;"
        >
            <div class="d-flex flex-column">
                <label class="form-label text-muted small mb-1">Дата первой недели</label>
                <input type="datetime-local" class="form-control" v-model="this.startFirstWeek" />
            </div>
                        
            <button 
                type="button" 
                class="btn btn-primary h-100 align-self-end mb-1"
                @click="this.UpdateSettings"
            >
            Сохранить изменения
            </button>                                
        </form>

        <!-- Блок Статуса и Логов -->
        <div v-if="parsingStatus" class="card mt-3 shadow-sm">
            <div class="card-header d-flex justify-content-between align-items-center">
                <div>
                    <strong>Статус: </strong>
                    <span class="badge" :class="parsingStates[parsingStatus.state]?.badge || 'bg-secondary'">
                        {{ parsingStates[parsingStatus.state]?.text || 'Неизвестно' }}
                    </span>
                </div>
                <div class="small text-muted text-end">
                    <div>Начало: {{ formatDate(parsingStatus.startedAt) }}</div>
                    <div v-if="parsingStatus.finishedAt">Конец: {{ formatDate(parsingStatus.finishedAt) }}</div>
                </div>
            </div>
            
            <!-- Ошибка, если есть -->
            <div v-if="parsingStatus.errorMessage" class="alert alert-danger m-0 rounded-0">
                <strong>Ошибка:</strong> {{ parsingStatus.errorMessage }}
            </div>

            <!-- Логи -->
            <div class="card-body bg-dark text-light p-2">
                <h6 class="text-white-50 border-bottom border-secondary pb-2">Логи процесса:</h6>
                <div 
                    ref="logContainer"
                    class="log-console"
                    style="max-height: 400px; overflow-y: auto; font-family: monospace; font-size: 0.9em;"
                >
                    <div v-if="!parsingStatus.logs || parsingStatus.logs.length === 0" class="text-muted fst-italic">
                        Логи пока пусты...
                    </div>
                    <div v-else v-for="(log, index) in parsingStatus.logs" :key="index" class="text-wrap text-break">
                        > {{ log }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.panel{
  border-style: solid;
  border-radius: 8px;
  border-width: 1px;
}
/* Скроллбар для логов, чтобы было красиво */
.log-console::-webkit-scrollbar {
    width: 8px;
}
.log-console::-webkit-scrollbar-track {
    background: #2b2b2b; 
}
.log-console::-webkit-scrollbar-thumb {
    background: #888; 
    border-radius: 4px;
}
.log-console::-webkit-scrollbar-thumb:hover {
    background: #555; 
}
</style>