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

test("should edit group", async t => {
  await asRegularUser(t);
  await t.click(".project-group__title");

  await t.click(".group__feed-title svg");
  await t.typeText(".group__feed-title-editor", "NewGroup-2");
  await t.click(".group__feed-title svg");

  await t.click(".group__feed-description svg");
  await t.typeText(".group__feed-description-editor", "New Description-2");
  await t.click(".group__feed-description svg");

  await t
    .expect(Selector(".group__feed-title").innerText)
    .contains("NewGroup-2");
  await t
    .expect(Selector(".group__feed-description").innerText)
    .contains("New Description-2");
});

test("should select group background", async t => {
  await asRegularUser(t);
  const file1 = await models.File.create({
    file: "some1"
  });
  const file2 = await models.File.create({
    file: "some2"
  });

  const bgFile1 = await models.ProjectGroupBackground.create({
    fileId: file1.id
  });

  const bgFile2 = await models.ProjectGroupBackground.create({
    fileId: file2.id
  });

  await t.click(".project-group__title");

  await t.click(".bg-select-icon");

  await t.click(".group__feed-background:nth-child(1)");
  let style = await Selector(".group__feed").style;
  await t.expect(style["background-image"]).contains("some1");

  await t.click(".group__feed-background:nth-child(2)");
  style = await Selector(".group__feed").style;
  await t.expect(style["background-image"]).contains("some2");
});
