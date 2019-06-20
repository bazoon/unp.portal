const models = require("../models");
const constants = require("../utils/constants");

module.exports = {
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
      constants.notifications.type.common
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
  eventCreated: function(config) {
    const { userId, title, eventId, recipientsIds } = config;
    const description = `Создано событие #${title}:event:${eventId}#`;
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
    return Promise.resolve(1);
    const p = createNotification(
      userId,
      description,
      constants.notifications.type.private,
      recipientId
    );

    return p;
  });
}
