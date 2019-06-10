import { Selector, Role, useRole } from "testcafe";
import models from "../models";

fixture`First`.page`http://localhost:5000/groups`;

function asRegularUser(t) {
  return t
    .click(".ant-tabs-tab:last-child")
    .typeText(".signup #normal_login_userName", "Соколова Виктория")
    .typeText(".signup #normal_login_password", "foo")
    .click(".signup-form-button");
}

test("should create group", async t => {
  await models.sequelize.sync({ force: true });

  await asRegularUser(t);

  await t
    .click(".project-groups__side-wrap button")
    .typeText("#GroupForm_title", "NewGroup")
    .typeText("#GroupForm_shortDescription", "Short")
    .typeText("#GroupForm_description", "Descr")
    .click(".ant-modal-footer button")
    .click(".ant-modal-footer button:last-child")
    .click(".ant-modal-footer button");

  await t.expect(Selector(".project-groups").innerText).contains("NewGroup");
});

test("should join group", async t => {
  await asRegularUser(t);
  await t.click(".project-group__join-button");

  await t
    .expect(Selector(".project-group__leave-button").innerText)
    .contains("Покинуть группу");
});

test("should leave group", async t => {
  await asRegularUser(t);
  await t.click(".project-group__leave-button");

  await t
    .expect(Selector(".project-group__join-button").innerText)
    .contains("Присоединиться");
});

test("should open group page as not participant", async t => {
  await asRegularUser(t);

  await t.click(".project-group__title");

  await t
    .expect(Selector(".project-group__join-button").innerText)
    .contains("Присоединиться")
    .expect(Selector(".group__feed-title").innerText)
    .contains("NewGroup")
    .expect(Selector(".group__feed-description").innerText)
    .contains("Short")
    .expect(Selector(".group__feed-files-info").innerText)
    .contains("нет файлов")
    .expect(Selector(".group__feed-show-link").innerText)
    .contains("Показать больше информации")
    .click(".group__feed-show-link")
    .expect(Selector(".group__feed-show-link").innerText)
    .contains("Показать меньше информации")
    .expect(Selector(".group__feed-rest-description").innerText)
    .contains("Descr");
});

test("should open group page as participant", async t => {
  await asRegularUser(t);

  await t.click(".project-group__join-button");
  await t.click(".project-group__title");

  await t
    .expect(Selector(".group__feed-title").innerText)
    .contains("NewGroup")
    .expect(Selector(".group__feed-description").innerText)
    .contains("Short")
    .expect(Selector(".group__feed-files-info").innerText)
    .contains("нет файлов")
    .expect(Selector(".group__feed-show-link").innerText)
    .contains("Показать больше информации")
    .click(".group__feed-show-link")
    .expect(Selector(".group__feed-show-link").innerText)
    .contains("Показать меньше информации")
    .expect(Selector(".group__feed-rest-description").innerText)
    .contains("Descr")
    .expect(Selector(".group__participant-name").innerText)
    .contains("Соколова Виктория");
});

test("can create conversation", async t => {
  await asRegularUser(t);

  await t.click(".project-group__title");
  await t.click(".group__add-region");

  await t
    .typeText("#GroupForm_title", "NewConversation")
    .typeText("#GroupForm_description", "ConversationDescription")
    .click(".group__conversation-form .ant-btn-primary");

  await t
    .expect(Selector(".group__conversation-title").innerText)
    .contains("NewConversation")
    .expect(Selector(".group__conversation-description").innerText)
    .contains("ConversationDescription");
});

test("can create post", async t => {
  await asRegularUser(t);
  await t.click(".project-group__title");
  await t.click(".group__conversation-title a");
  await t.typeText(".group__post-form input", "Random Post").pressKey("enter");
  await t.expect(Selector(".group__post-text").innerText).eql("Random Post");
});
