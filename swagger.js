export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Task Manager API",
    description: "API для управления задачами с аутентификацией через JWT",
    version: "1.0.0",
    contact: {
      name: "API Support",
    },
  },
  servers: [
    {
      url: "https://todo-list-backend-w3z0.onrender.com",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT токен, полученный при логине",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid",
            example: "be80de0a-aa7c-4cd9-ac7b-f333588ce82d",
            description: "Уникальный идентификатор пользователя",
          },
          email: {
            type: "string",
            format: "email",
            example: "user@example.com",
            description: "Email пользователя",
          },
        },
      },
      RegisterRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "user@example.com",
            description: "Email пользователя",
          },
          password: {
            type: "string",
            format: "password",
            minLength: 6,
            example: "secure123",
            description: "Пароль (минимум 6 символов)",
          },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "user@example.com",
          },
          password: {
            type: "string",
            format: "password",
            example: "secure123",
          },
        },
      },
      LoginResponse: {
        type: "object",
        properties: {
          token: {
            type: "string",
            description: "JWT токен для авторизации",
            example:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImJlODBkZTBhLWFhN2MtNGNkOS1hYzdiLWYzMzM1ODhjZTgyZCIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsImlhdCI6MTY5MDgxMjQwMCwiZXhwIjoxNjkwODE2MDAwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
          },
        },
      },
      Task: {
        type: "object",
        properties: {
          userId: {
            type: "string",
            format: "uuid",
            description: "ID пользователя, которому принадлежит задача",
            example: "be80de0a-aa7c-4cd9-ac7b-f333588ce82d",
          },
          id: {
            type: "integer",
            description: "Уникальный числовой идентификатор задачи",
            example: 1,
          },
          title: {
            type: "string",
            description: "Название задачи",
            example: "Купить продукты",
          },
          done: {
            type: "boolean",
            description: "Статус выполнения задачи",
            example: false,
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Дата и время создания задачи",
            example: "2026-07-31T10:30:00.000Z",
          },
        },
      },
      CreateTaskRequest: {
        type: "object",
        required: ["title"],
        properties: {
          title: {
            type: "string",
            description: "Название задачи",
            example: "Купить продукты",
          },
        },
      },
      UpdateTitleRequest: {
        type: "object",
        required: ["newTitle"],
        properties: {
          newTitle: {
            type: "string",
            description: "Новое название задачи",
            example: "Купить молоко и хлеб",
          },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          error: {
            type: "string",
            description: "Текст ошибки",
            example: "Токен истек",
          },
        },
      },
      PlainTextResponse: {
        type: "string",
        description: "Текстовый ответ сервера",
        example: "Таска добавлена!",
      },
    },
  },
  security: [
    {
      BearerAuth: [],
    },
  ],
  paths: {
    "/register": {
      post: {
        summary: "Регистрация нового пользователя",
        description: "Создает нового пользователя с указанным email и паролем",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RegisterRequest",
              },
              examples: {
                default: {
                  value: {
                    email: "user@example.com",
                    password: "secure123",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Пользователь успешно зарегистрирован",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/User",
                },
                example: {
                  id: "be80de0a-aa7c-4cd9-ac7b-f333588ce82d",
                  email: "user@example.com",
                },
              },
            },
          },
          400: {
            description:
              "Некорректные данные (email уже существует или невалидный формат)",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          500: {
            description: "Ошибка сервера",
          },
        },
      },
    },
    "/login": {
      post: {
        summary: "Аутентификация пользователя",
        description:
          "Вход в систему. Возвращает JWT токен для последующих запросов",
        tags: ["Auth"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/LoginRequest",
              },
              examples: {
                default: {
                  value: {
                    email: "user@example.com",
                    password: "secure123",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Успешный вход",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/LoginResponse",
                },
                example: {
                  token:
                    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImJlODBkZTBhLWFhN2MtNGNkOS1hYzdiLWYzMzM1ODhjZTgyZCIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsImlhdCI6MTY5MDgxMjQwMCwiZXhwIjoxNjkwODE2MDAwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
                },
              },
            },
          },
          401: {
            description: "Неверный email или пароль",
            content: {
              "text/plain": {
                schema: {
                  type: "string",
                  example: "Неверный email или password",
                },
              },
            },
          },
          500: {
            description: "Ошибка сервера",
          },
        },
      },
    },
    "/createFile": {
      get: {
        summary: "Создать файл базы данных",
        description:
          "Инициализирует файл db.json (используется для тестирования)",
        tags: ["Admin"],
        responses: {
          200: {
            description: "Файл создан",
            content: {
              "text/plain": {
                schema: {
                  type: "string",
                  example: "Создал!",
                },
              },
            },
          },
          500: {
            description: "Ошибка сервера (файл уже существует или нет прав)",
          },
        },
      },
    },
    "/readFile": {
      get: {
        summary: "Проверить существование файла",
        description: "Проверяет доступность файла db.json",
        tags: ["Admin"],
        responses: {
          200: {
            description: "Файл существует",
          },
          404: {
            description: "Файл не найден",
            content: {
              "text/plain": {
                schema: {
                  type: "string",
                  example: "Файл не найден",
                },
              },
            },
          },
          500: {
            description: "Ошибка сервера",
          },
        },
      },
    },
    "/deleteFile": {
      delete: {
        summary: "Удалить файл базы данных",
        description: "Удаляет файл db.json (используется для тестирования)",
        tags: ["Admin"],
        responses: {
          200: {
            description: "Файл удален",
            content: {
              "text/plain": {
                schema: {
                  type: "string",
                  example: "Файл db.json удален",
                },
              },
            },
          },
          404: {
            description: "Файл не найден",
            content: {
              "text/plain": {
                schema: {
                  type: "string",
                  example: "Такой файл не найден!",
                },
              },
            },
          },
          500: {
            description: "Ошибка сервера",
          },
        },
      },
    },
    "/createTask": {
      post: {
        summary: "Создать новую задачу",
        description: "Создает задачу для авторизованного пользователя",
        tags: ["Tasks"],
        security: [
          {
            BearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateTaskRequest",
              },
              examples: {
                default: {
                  value: {
                    title: "Купить продукты",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Задача создана",
            content: {
              "text/plain": {
                schema: {
                  type: "string",
                  example: "Таска добавлена!",
                },
              },
            },
          },
          401: {
            description: "Неавторизован (отсутствует или невалидный токен)",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          404: {
            description: "Файл db.json не найден",
            content: {
              "text/plain": {
                schema: {
                  type: "string",
                  example: "Файл не найден",
                },
              },
            },
          },
          500: {
            description: "Ошибка сервера",
          },
        },
      },
    },
    "/readTasks/user/{userId}": {
      get: {
        summary: "Получить все задачи пользователя",
        description: "Возвращает список всех задач указанного пользователя",
        tags: ["Tasks"],
        parameters: [
          {
            name: "userId",
            in: "path",
            required: true,
            description: "UUID пользователя",
            schema: {
              type: "string",
              format: "uuid",
              example: "be80de0a-aa7c-4cd9-ac7b-f333588ce82d",
            },
          },
        ],
        responses: {
          200: {
            description: "Список задач",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Task",
                  },
                },
                example: [
                  {
                    userId: "be80de0a-aa7c-4cd9-ac7b-f333588ce82d",
                    id: 1,
                    title: "Купить продукты",
                    done: false,
                    createdAt: "2026-07-31T10:30:00.000Z",
                  },
                  {
                    userId: "be80de0a-aa7c-4cd9-ac7b-f333588ce82d",
                    id: 2,
                    title: "Сделать домашку",
                    done: true,
                    createdAt: "2026-07-31T11:00:00.000Z",
                  },
                ],
              },
            },
          },
          404: {
            description: "Задачи не найдены или файл не существует",
            content: {
              "text/plain": {
                schema: {
                  type: "string",
                  example: "Для вашего пользователя задачи не найдены",
                },
              },
            },
          },
          500: {
            description: "Ошибка сервера",
          },
        },
      },
    },
    "/readTask/{id}": {
      get: {
        summary: "Получить задачу по ID",
        description:
          "Возвращает информацию о конкретной задаче по её числовому ID",
        tags: ["Tasks"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Числовой ID задачи",
            schema: {
              type: "integer",
              example: 1,
            },
          },
        ],
        responses: {
          200: {
            description: "Задача найдена",
            content: {
              "text/plain": {
                schema: {
                  type: "string",
                  example: "Таска найдена!",
                },
              },
            },
          },
          404: {
            description: "Задача не найдена или файл не существует",
            content: {
              "text/plain": {
                schema: {
                  type: "string",
                  example: "Таска не найдена",
                },
              },
            },
          },
          500: {
            description: "Ошибка сервера",
          },
        },
      },
    },
    "/updateDone/{id}": {
      patch: {
        summary: "Переключить статус выполнения задачи",
        description:
          "Инвертирует статус done задачи (true↔false). Доступно только владельцу задачи",
        tags: ["Tasks"],
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Числовой ID задачи",
            schema: {
              type: "integer",
              example: 1,
            },
          },
        ],
        responses: {
          200: {
            description: "Статус задачи изменен",
            content: {
              "text/plain": {
                schema: {
                  type: "string",
                  example: "Таска изменена!",
                },
              },
            },
          },
          401: {
            description: "Неавторизован",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          403: {
            description:
              "Нет прав на изменение (задача принадлежит другому пользователю)",
            content: {
              "text/plain": {
                schema: {
                  type: "string",
                  example: "Нет прав на изменение этой задачи",
                },
              },
            },
          },
          404: {
            description: "Задача или файл не найдены",
            content: {
              "text/plain": {
                schema: {
                  type: "string",
                  example: "Таска не найдена",
                },
              },
            },
          },
          500: {
            description: "Ошибка сервера",
          },
        },
      },
    },
    "/updateTitle/{id}": {
      put: {
        summary: "Обновить название задачи",
        description:
          "Изменяет название задачи. Доступно только владельцу задачи",
        tags: ["Tasks"],
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Числовой ID задачи",
            schema: {
              type: "integer",
              example: 1,
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateTitleRequest",
              },
              examples: {
                default: {
                  value: {
                    newTitle: "Купить молоко и хлеб",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Название задачи обновлено",
            content: {
              "text/plain": {
                schema: {
                  type: "string",
                  example: "Тайтл таски изменен",
                },
              },
            },
          },
          401: {
            description: "Неавторизован",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          403: {
            description: "Нет прав на изменение",
            content: {
              "text/plain": {
                schema: {
                  type: "string",
                  example: "Нет прав на изменение этой задачи",
                },
              },
            },
          },
          404: {
            description: "Задача или файл не найдены",
            content: {
              "text/plain": {
                schema: {
                  type: "string",
                  example: "Таска не найдена",
                },
              },
            },
          },
          500: {
            description: "Ошибка сервера",
          },
        },
      },
    },
    "/deleteTask/{id}": {
      delete: {
        summary: "Удалить задачу",
        description: "Удаляет задачу по ID. Доступно только владельцу задачи",
        tags: ["Tasks"],
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "Числовой ID задачи",
            schema: {
              type: "integer",
              example: 1,
            },
          },
        ],
        responses: {
          200: {
            description: "Задача удалена",
            content: {
              "text/plain": {
                schema: {
                  type: "string",
                  example: "Таска удалена!",
                },
              },
            },
          },
          401: {
            description: "Неавторизован",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          403: {
            description: "Нет прав на удаление",
            content: {
              "text/plain": {
                schema: {
                  type: "string",
                  example: "Нет прав на удаление этой задачи",
                },
              },
            },
          },
          404: {
            description: "Задача или файл не найдены",
            content: {
              "text/plain": {
                schema: {
                  type: "string",
                  example: "Задача с таким ID не найдена",
                },
              },
            },
          },
          500: {
            description: "Ошибка сервера",
          },
        },
      },
    },
  },
};
