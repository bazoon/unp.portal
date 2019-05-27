"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "positions",
      [
        {
          id: 1,
          name: "Аналитик",
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        },
        {
          id: 2,
          name: "Менеджер",
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        },
        {
          id: 3,
          name:
            "Первый заместитель Председателя Правительства Российской Федерации - Министр финансов Российской Федерации",
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        },
        {
          id: 4,
          name: "Министр экономического развития Российской Федерации",
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        },
        {
          id: 5,
          name:
            "Заместитель Министра экономического развития Российской Федерации",
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        }
      ],
      {}
    );

    await queryInterface.bulkInsert(
      "organizations",
      [
        {
          id: 1,
          name: "ООО Газпром",
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        },
        {
          id: 2,
          name: "АО Барс Груп",
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        },
        {
          id: 3,
          name: "ООО Поребрик",
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        }
      ],
      {}
    );

    await queryInterface.bulkInsert(
      "users",
      [
        {
          id: 1,
          name: "Соколова Виктория",
          login: "sokol",
          password:
            "$2a$08$i0OKfjIlkrluyUU2ejHcJej9F8s711WKTvaPKaTU2MwrouxXJsVre",
          is_admin: true,
          position_id: 1,
          organization_id: 1,
          avatar: "av1.jpg",
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        },
        {
          id: 2,
          name: "Силуанов Антон Германович",
          login: "sokol",
          password:
            "$2a$08$i0OKfjIlkrluyUU2ejHcJej9F8s711WKTvaPKaTU2MwrouxXJsVre",
          is_admin: true,
          position_id: 3,
          organization_id: 1,
          avatar: "5.jpg",
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        },
        {
          id: 3,
          name: "Орешкин Максим Станиславович",
          login: "sokol",
          password:
            "$2a$08$i0OKfjIlkrluyUU2ejHcJej9F8s711WKTvaPKaTU2MwrouxXJsVre",
          is_admin: true,
          position_id: 4,
          organization_id: 1,
          avatar: "5.jpg",
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        },
        {
          id: 4,
          name: "Живулин Вадим Александрович",
          login: "sokol",
          password:
            "$2a$08$i0OKfjIlkrluyUU2ejHcJej9F8s711WKTvaPKaTU2MwrouxXJsVre",
          is_admin: true,
          position_id: 5,
          organization_id: 1,
          avatar: "5.jpg",
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        },
        {
          id: 5,
          name: "Петров Вадим Максимович",
          login: "sokol",
          password:
            "$2a$08$i0OKfjIlkrluyUU2ejHcJej9F8s711WKTvaPKaTU2MwrouxXJsVre",
          is_admin: true,
          position_id: 5,
          organization_id: 1,
          avatar: "5.jpg",
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        },
        {
          id: 6,
          name: "Иванов И И",
          login: "sokol",
          password:
            "$2a$08$i0OKfjIlkrluyUU2ejHcJej9F8s711WKTvaPKaTU2MwrouxXJsVre",
          is_admin: true,
          position_id: 5,
          organization_id: 1,
          avatar: "5.jpg",
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        },
        {
          id: 7,
          name: "Петров Вадим Максимович",
          login: "sokol",
          password:
            "$2a$08$i0OKfjIlkrluyUU2ejHcJej9F8s711WKTvaPKaTU2MwrouxXJsVre",
          is_admin: true,
          position_id: 5,
          organization_id: 1,
          avatar: "5.jpg",
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        },
        {
          id: 8,
          name: "Петров Вадим Максимович",
          login: "sokol",
          password:
            "$2a$08$i0OKfjIlkrluyUU2ejHcJej9F8s711WKTvaPKaTU2MwrouxXJsVre",
          is_admin: true,
          position_id: 5,
          organization_id: 1,
          avatar: "5.jpg",
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        },
        {
          id: 9,
          name: "Петров Вадим Максимович",
          login: "sokol",
          password:
            "$2a$08$i0OKfjIlkrluyUU2ejHcJej9F8s711WKTvaPKaTU2MwrouxXJsVre",
          is_admin: true,
          position_id: 5,
          organization_id: 1,
          avatar: "5.jpg",
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        },
        {
          id: 10,
          name: "Петров Вадим Максимович",
          login: "sokol",
          password:
            "$2a$08$i0OKfjIlkrluyUU2ejHcJej9F8s711WKTvaPKaTU2MwrouxXJsVre",
          is_admin: true,
          position_id: 5,
          organization_id: 1,
          avatar: "5.jpg",
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        },
        {
          id: 11,
          name: "Петров Вадим Максимович",
          login: "sokol",
          password:
            "$2a$08$i0OKfjIlkrluyUU2ejHcJej9F8s711WKTvaPKaTU2MwrouxXJsVre",
          is_admin: true,
          position_id: 5,
          organization_id: 1,
          avatar: "5.jpg",
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        },
        {
          id: 12,
          name: "Петров Вадим Максимович",
          login: "sokol",
          password:
            "$2a$08$i0OKfjIlkrluyUU2ejHcJej9F8s711WKTvaPKaTU2MwrouxXJsVre",
          is_admin: true,
          position_id: 5,
          organization_id: 1,
          avatar: "5.jpg",
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        },
        {
          id: 13,
          name: "Петров Вадим Максимович",
          login: "sokol",
          password:
            "$2a$08$i0OKfjIlkrluyUU2ejHcJej9F8s711WKTvaPKaTU2MwrouxXJsVre",
          is_admin: true,
          position_id: 5,
          organization_id: 1,
          avatar: "5.jpg",
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        },
        {
          id: 14,
          name: "Петров Вадим Максимович",
          login: "sokol",
          password:
            "$2a$08$i0OKfjIlkrluyUU2ejHcJej9F8s711WKTvaPKaTU2MwrouxXJsVre",
          is_admin: true,
          position_id: 5,
          organization_id: 1,
          avatar: "5.jpg",
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        }
      ],
      {}
    );

    await queryInterface.bulkInsert(
      "project_groups",
      [
        {
          id: 1,
          title: "Федеральные проекты",
          avatar: "4.png",
          is_open: true,
          description:
            "Группа создана с целью мониторинга процессов исполнения национального проекта в сфере развития малого и среднего предпринимательства и поддержки индивидуальной предпринимательской инициативы. Целью данного проекта является увеличение численности занятых в сфере малого и среднего предпринимательства, включая индивидуальных предпринимателей, до 25 млн. человек.",
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05",
          user_id: 1
        },
        {
          id: 2,
          title: "Региональные проекты",
          avatar: "4.png",
          is_open: true,
          description:
            "Группа создана с целью мониторинга процессов исполнения национального проекта в сфере развития малого и среднего предпринимательства и поддержки индивидуальной предпринимательской инициативы. Целью данного проекта является увеличение численности занятых в сфере малого и среднего предпринимательства, включая индивидуальных предпринимателей, до 25 млн. человек.",
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05",
          user_id: 1
        }
      ],
      {}
    );

    await queryInterface.bulkInsert(
      "participant_roles",
      [
        {
          id: 1,
          name: "Куратор",
          level: 1,
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        },
        {
          id: 2,
          name: "Руководитель проекта",
          level: 2,
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        },
        {
          id: 3,
          name: "Администратор проекта",
          level: 3,
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        },
        {
          id: 4,
          name: "Участник проекта",
          level: 4,
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        }
      ],
      {}
    );

    await queryInterface.bulkInsert(
      "participants",
      [
        {
          id: 1,
          project_group_id: 1,
          user_id: 2,
          participant_role_id: 1,
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        },
        {
          id: 2,
          project_group_id: 1,
          user_id: 3,
          participant_role_id: 2,
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        },
        {
          id: 3,
          project_group_id: 1,
          user_id: 4,
          participant_role_id: 3,
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        },
        {
          id: 4,
          project_group_id: 1,
          user_id: 1,
          participant_role_id: 4,
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        },
        {
          id: 5,
          project_group_id: 1,
          user_id: 1,
          participant_role_id: 4,
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        },
        {
          id: 6,
          project_group_id: 1,
          user_id: 6,
          participant_role_id: 4,
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        },
        {
          id: 7,
          project_group_id: 1,
          user_id: 7,
          participant_role_id: 4,
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        },
        {
          id: 8,
          project_group_id: 1,
          user_id: 8,
          participant_role_id: 4,
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        },
        {
          id: 9,
          project_group_id: 1,
          user_id: 9,
          participant_role_id: 4,
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        },
        {
          id: 10,
          project_group_id: 1,
          user_id: 10,
          participant_role_id: 4,
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        },
        {
          id: 11,
          project_group_id: 1,
          user_id: 11,
          participant_role_id: 4,
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        },
        {
          id: 12,
          project_group_id: 1,
          user_id: 12,
          participant_role_id: 4,
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        },
        {
          id: 13,
          project_group_id: 1,
          user_id: 13,
          participant_role_id: 4,
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        },
        {
          id: 14,
          project_group_id: 1,
          user_id: 14,
          participant_role_id: 4,
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        }
      ],
      {}
    );

    return queryInterface.bulkInsert(
      "conversations",
      [
        {
          id: 1,
          user_id: 1,
          title: "Основные направления деятельности проекта",
          description:
            "Утвердить до 1 октября 2018 г. Основные направления деятельности проекта на период до 2024 года и прогноз реализации проекта на период до 2024 года, предусмотрев механизмы и ресурсное обеспечение достижения национальных целей, определённых пунктом 1 Указа «О национальных целях и стратегических задачах развития Российской Федерации на период до 2024 года». утвердить до 1 октября 2018 г. Основные направления деятельности проекта на период до 2024 года и прогноз реализации проекта на период до 2024 года, предусмотрев механизмы и ресурсное обеспечение достижения национальных целей, определённых пунктом 1 Указа «О национальных целях и стратегических задачах развития Российской Федерации на период до 2024 года»",
          is_commentable: true,
          project_group_id: 1,
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        },
        {
          id: 2,
          user_id: 1,
          title: "Важное объявление",
          description:
            "Утвердить до 1 октября 2018 г. Основные направления деятельности проекта на период до 2024 года и прогноз реализации проекта на период до 2024 года, предусмотрев механизмы и ресурсное обеспечение достижения национальных целей, определённых пунктом 1 Указа «О национальных целях и стратегических задачах развития Российской Федерации на период до 2024 года». утвердить до 1 октября 2018 г. Основные направления деятельности проекта на период до 2024 года и прогноз реализации проекта на период до 2024 года, предусмотрев механизмы и ресурсное обеспечение достижения национальных целей, определённых пунктом 1 Указа «О национальных целях и стратегических задачах развития Российской Федерации на период до 2024 года»",
          is_commentable: true,
          project_group_id: 1,
          created_at: "2019-05-23 17:15:29.054+05",
          updated_at: "2019-05-23 17:15:29.054+05"
        }
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("participants", null, {});
    await queryInterface.bulkDelete("project_groups", null, {});
    await queryInterface.bulkDelete("users", null, {});
    await queryInterface.bulkDelete("positions", null, {});
    await queryInterface.bulkDelete("organizations", null, {});
    await queryInterface.bulkDelete("organizations", null, {});
    await queryInterface.bulkDelete("conversations", null, {});
    return queryInterface.bulkDelete("participant_roles", null, {});
  }
};
