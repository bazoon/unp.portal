const models = require("../models");
const constants = require("../utils/constants");

module.exports = {
  superAdminAdded: function(config) {
    const { userId, adminId, adminName } = config;
    return createNotification(
      userId,
      `Назначен новый администратор портала #${adminName}:user:${adminId}#`,
      constants.notifications.type.common
    );
  },
  superAdminRemoved: function(config) {
    const { userId, adminId, adminName } = config;
    return createNotification(
      userId,
      `Снят с должности администратора портала #${adminName}:user:${adminId}#`,
      constants.notifications.type.common
    );
  },
  documentsAdded: function(config) {
    const { userId, files } = config;

    const filesDescription = files
      .reduce((acc, file) => {
        return acc.concat(`#${file.name}:file:${file.url}#`);
      }, [])
      .join("");

    return createNotification(
      userId,
      `В реестр документов добавлены файлы ${filesDescription}`,
      constants.notifications.type.common
    );
  },
  documentRemoved: function(config) {
    const { userId, file } = config;

    return createNotification(
      userId,
      `Из реестра документов удален файл #${file}:file_removed:_#`,
      constants.notifications.type.common
    );
  },
  groupNameChanged: function(config) {
    const { userId, oldTitle, title, groupId } = config;
    const description = `Группа #${oldTitle}:group:${groupId}# переименована в #${title}:group:${groupId}`;
    return createNotification(
      userId,
      description,
      constants.notifications.type.common
    );
  },
  groupDescriptionChanged: function(config) {
    const { userId, title, groupId } = config;
    const description = `У группы #${title}:group:${groupId}# изменилось описание`;
    return createNotification(
      userId,
      description,
      constants.notifications.type.common
    );
  },
  groupAvatarChanged: function(config) {
    const { userId, title, groupId } = config;
    const description = `У группы #${title}:group:${groupId}# изменился аватар`;
    return createNotification(
      userId,
      description,
      constants.notifications.type.common
    );
  },
  groupCreated: function(config) {
    const { userId, title, groupId } = config;
    const description = `Создана группа #${title}:group:${groupId}#`;
    return createNotification(
      userId,
      description,
      constants.notifications.type.common
    );
  },
  groupRemoved: function(config) {
    const { userId, title, groupId } = config;
    const description = `Удалена группа #${title}:group:${groupId}#`;
    return createNotification(
      userId,
      description,
      constants.notifications.type.common
    );
  },
  conversationCreated: function(config) {
    const {
      userId,
      groupId,
      groupTitle,
      conversationTitle,
      conversationId,
      recipientsIds
    } = config;
    const description = `Новое обсуждение #${conversationTitle}:conversation:${groupId}-${conversationId}# в группе #${groupTitle}:group:${groupId}#`;
    return createForRecipients(userId, description, recipientsIds);
  },
  postCreated: function(config) {
    const {
      userId,
      userName,
      groupId,
      conversationId,
      conversationTitle,
      groupTitle,
      text,
      recipientsIds
    } = config;
    console.log(recipientsIds);
    const description = `#${userName}:user:${userId}# написал «${text}» в обсуждении #${conversationTitle}:conversation:${groupId}-${conversationId}# в группе #${groupTitle}:group:${groupId}#`;
    return createForRecipients(userId, description, recipientsIds);
  },
  groupParticipantJoined: function(config) {
    const {
      userId,
      title,
      groupId,
      applicantId,
      applicantName,
      recipientsIds
    } = config;
    const description = `В группу #${title}:group:${groupId}# 
                        вступил #${applicantName}:user:${applicantId}`;
    return createForRecipients(userId, description, recipientsIds);
  },
  groupParticipantLeft: function(config) {
    const {
      userId,
      title,
      groupId,
      applicantId,
      applicantName,
      recipientsIds
    } = config;
    const description = `Из группы #${title}:group:${groupId}# 
                        вышел #${applicantName}:user:${applicantId}`;
    return createForRecipients(userId, description, recipientsIds);
  },
  groupRequestApplied: function(config) {
    const {
      userId,
      title,
      groupId,
      applicantId,
      applicantName,
      recipientsIds
    } = config;
    const description = `Подана заявка в группу #${title}:group:${groupId}# 
                        от #${applicantName}:user:${applicantId}`;
    return createForRecipients(userId, description, recipientsIds);
  },
  groupRequestApproved: function(config) {
    const { userId, recipientId, groupId, groupTitle } = config;
    const description = `Ваша заявка в группу #${groupTitle}:group:${groupId}# одобрена.`;
    return createNotification(
      userId,
      description,
      constants.notifications.type.private,
      recipientId
    );
  },
  groupAdminAssigned: function(config) {
    const {
      userId,
      recipientsIds,
      groupId,
      groupTitle,
      adminId,
      adminName
    } = config;
    const description = `В группу #${groupTitle}:group:${groupId}# 
                        назначен новый администратор - #${adminName}:user:${adminId}`;
    return createForRecipients(userId, description, recipientsIds);
  },
  groupAdminRemoved: function(config) {
    const {
      userId,
      recipientsIds,
      groupId,
      groupTitle,
      adminId,
      adminName
    } = config;
    const description = `С пользователя #${adminName}:user:${adminId}# сняты полномочия админа группы #${groupTitle}:group:${groupId}#`;
    return createForRecipients(userId, description, recipientsIds);
  },
  participantRemoved: function(config) {
    const {
      userId,
      groupId,
      groupTitle,
      participantUserId,
      participantName,
      recipientsIds
    } = config;
    const description = `Пользователь #${participantName}:user:${participantUserId}# исключен из группы #${groupTitle}:group:${groupId}#`;

    return createForRecipients(userId, description, recipientsIds);
  },
  eventCreated: function(config) {
    const { userId, title, eventId, recipientsIds } = config;
    const description = `Создано событие #${title}:event:${eventId}#`;
    return createForRecipients(userId, description, recipientsIds);
  },
  eventUpdated: function(config) {
    const { userId, title, eventId, recipientsIds } = config;
    const description = `Изменено событие #${title}:event:${eventId}#`;
    return createForRecipients(userId, description, recipientsIds);
  },
  eventRemoved: function(config) {
    const { userId, title, eventId, recipientsIds } = config;
    const description = `Удалено событие ${title}`;
    return createForRecipients(userId, description, recipientsIds);
  }
};

function createNotification(userId, description, type, recipientId) {
  return models.Notification.create({
    userId,
    description,
    recipientId,
    type
  });
}

function createForRecipients(userId, description, recipientsIds) {
  // Тут нечто странное
  // выглядит как-будто должен вернуться array промисов
  // но возвращается один промис, как-будто кто-то вызвал для них Promise.all
  return recipientsIds.map(recipientId => {
    const p = createNotification(
      userId,
      description,
      constants.notifications.type.private,
      recipientId
    );

    return p;
  });
}
