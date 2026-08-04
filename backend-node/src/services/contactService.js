const BaseModel = require("../models/baseModel");

class ContactService {
  async getContacts() {
    return BaseModel.findAll("contacts", {}, "created_at DESC");
  }

  async createContact(payload) {
    return BaseModel.create("contacts", {
      name: payload.name,
      email: payload.email,
      message: payload.message,
      created_at: new Date(),
    });
  }
}

module.exports = new ContactService();
