const contactService = require("../services/contactService");

async function listContacts(req, res, next) {
  try {
    const contacts = await contactService.getContacts();
    res.json({ success: true, data: contacts });
  } catch (error) {
    next(error);
  }
}

async function createContact(req, res, next) {
  try {
    const contact = await contactService.createContact(req.body);
    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    next(error);
  }
}

module.exports = { listContacts, createContact };
