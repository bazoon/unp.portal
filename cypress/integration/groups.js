// const models = require("../../models/index");
const faker = require("faker");

function genGroup(params) {}

const user1 = {
  surName: "Соколова",
  firstName: "Виктория",
  lastName: "Викторовна",
  email: "foo@mail.com",
  password: "foo",
  login: "sokol"
};

const user2 = {
  surName: "Парамонова",
  firstName: "Лидия",
  lastName: "Викторовна",
  email: "foo@mail.com",
  password: "foo",
  login: "sokol1"
};

const group1 = {
  title: "Новая группа",
  shortDescription: "Короткое описание",
  description: "Длинное описание"
};

function signup(config) {
  cy.get(".signup-link").click();
  cy.get("#normal_login_surName").type(config.surName);
  cy.get("#normal_login_firstName").type(config.firstName);
  cy.get("#normal_login_lastName").type(config.lastName);
  cy.get("#normal_login_email").type(config.email);
  cy.get("#normal_login_password").type(config.password);
  cy.get("#normal_login_confirm").type(config.password);
  cy.get("#normal_login_login").type(config.login);
  cy.get(".login-form__button").click();
}

function exit() {
  cy.get(".header__user .anticon-down").click();
  cy.get(".ant-popover-inner-content div").click();
}

function createGroup(config) {
  cy.get(".side-wrap button").click();
  cy.get("#GroupForm_title").type(config.title);
  cy.get("#GroupForm_shortDescription").type(config.shortDescription);
  cy.get("#GroupForm_description").type(config.description);
  cy.get(".ant-modal-footer button").click();
  cy.get(".ant-modal-footer button:last-child").click();
  cy.get(".ant-modal-footer button:first-child").click();
  cy.get(".project-groups").contains(config.title);
}

describe("Groups", function() {
  before(function() {
    // cy.exec("npm run clear:testdb");
  });

  it("Join group, leave group", function() {
    cy.request("http://localhost:5000/clear");
    cy.visit("http://localhost:5000/groups");

    // Login one user
    signup(user1);
    cy.request("http://localhost:5000/clear");
    createGroup(group1);
    exit();
    signup(user2);

    // Join group
    cy.get(".project-group__join-button").click();
    cy.get(".project-group__leave-button").contains("Покинуть группу");
    cy.get(".project-group__leave-button").click();
    cy.get(".project-group__join-button").contains("Присоединиться");
  });

  it("User can view group page as not participant", function() {
    // cy.exec("npm run clear:testdb");
    cy.request("http://localhost:5000/clear");
    exit();
    signup(user1);
    createGroup(group1);
    exit();
    signup(user2);
    cy.get(".project-group a").click();
    cy.get(".project-group__join-button").contains("Присоединиться");
    cy.get(".group__feed-title").contains(group1.title);
    cy.get(".group__feed-description").contains(group1.shortDescription);
    cy.get(".group__feed-files-info").contains("нет файлов");
    cy.get(".group__feed-show-link")
      .contains("Показать больше информации")
      .click();
    cy.get(".group__feed-show-link").contains("Показать меньше информации");
    cy.get(".group__feed-rest-description").contains(group1.description);
  });
});
