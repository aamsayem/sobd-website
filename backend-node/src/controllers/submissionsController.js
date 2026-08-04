const VolunteerApplication = require("../models/VolunteerApplication");
const ShokkhomApplication = require("../models/ShokkhomApplication");
const Donation = require("../models/Donation");
const ContactMessage = require("../models/ContactMessage");
const Campaign = require("../models/Campaign");
const { resolveBodyUrls } = require("../utils/urlResolver");

function getModel(resource) {
  switch (resource) {
    case "volunteer-applications":
      return VolunteerApplication;
    case "sokkhom-applications":
      return ShokkhomApplication;
    case "donation-requests":
      return Donation;
    case "contact-messages":
      return ContactMessage;
    default:
      return null;
  }
}

async function getSubmissions(req, res, next) {
  try {
    const { resource } = req.params;
    const Model = getModel(resource);
    if (!Model) {
      return res.status(404).json({ success: false, message: `Resource ${resource} not found` });
    }

    let query = Model.find();

    if (resource === "volunteer-applications") {
      query = query.populate("photo").populate("created_by").populate("updated_by");
    } else if (resource === "sokkhom-applications") {
      query = query.populate("photo").populate("supporting_documents").populate("created_by").populate("updated_by");
    } else if (resource === "donation-requests") {
      query = query.populate("campaign").populate("proof_screenshot").populate("verified_by");
    }

    const docs = await query.exec();
    const formatted = docs.map(doc => {
      const obj = doc.toObject();
      obj.id = obj._id.toString();

      // Sync status for frontend compatibility
      if (obj.application_status) {
        obj.status = obj.application_status;
      }

      if (resource === "contact-messages") {
        obj.sender_name = obj.name;
        obj.mobile = obj.phone;
        obj.is_read = obj.is_read || false;
      }

      if ((resource === "volunteer-applications" || resource === "sokkhom-applications") && !obj.application_code) {
        obj.application_code = `APP-${obj.id.slice(-6).toUpperCase()}`;
      }

      return obj;
    });

    res.json(formatted);
  } catch (error) {
    next(error);
  }
}

async function getSubmissionById(req, res, next) {
  try {
    const { resource, id } = req.params;
    const Model = getModel(resource);
    if (!Model) {
      return res.status(404).json({ success: false, message: `Resource ${resource} not found` });
    }

    let query = Model.findById(id);

    if (resource === "volunteer-applications") {
      query = query.populate("photo").populate("created_by").populate("updated_by");
    } else if (resource === "sokkhom-applications") {
      query = query.populate("photo").populate("supporting_documents").populate("created_by").populate("updated_by");
    } else if (resource === "donation-requests") {
      query = query.populate("campaign").populate("proof_screenshot").populate("verified_by");
    }

    const doc = await query.exec();
    if (!doc) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    const obj = doc.toObject();
    obj.id = obj._id.toString();

    if (obj.application_status) {
      obj.status = obj.application_status;
    }

    if (resource === "contact-messages") {
      obj.sender_name = obj.name;
      obj.mobile = obj.phone;
      obj.is_read = obj.is_read || false;
    }

    if ((resource === "volunteer-applications" || resource === "sokkhom-applications") && !obj.application_code) {
      obj.application_code = `APP-${obj.id.slice(-6).toUpperCase()}`;
    }

    res.json(obj);
  } catch (error) {
    next(error);
  }
}

async function createSubmission(req, res, next) {
  try {
    const { resource } = req.params;
    const Model = getModel(resource);
    if (!Model) {
      return res.status(404).json({ success: false, message: `Resource ${resource} not found` });
    }

    const body = { ...req.body };
    await resolveBodyUrls(body);

    // Support both CamelCase and snake_case for donations
    if (resource === "donation-requests") {
      if (body.donorName) {
        body.donor_name = body.donorName;
        delete body.donorName;
      }
      if (body.donorEmail) {
        body.email = body.donorEmail;
        delete body.donorEmail;
      }

      // Find or create default campaign if not a valid Mongoose ObjectId
      let campaignId = body.campaign;
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(campaignId);
      if (!isObjectId || !campaignId) {
        let campaignDoc = await Campaign.findOne({
          $or: [{ slug: campaignId }, { title: campaignId }],
        });
        if (!campaignDoc) {
          campaignDoc = await Campaign.findOne({});
        }
        if (!campaignDoc) {
          campaignDoc = new Campaign({
            title: "General Donation Campaign",
            slug: "general-donation",
            goal_amount: 1000000,
            status: "published",
          });
          await campaignDoc.save();
        }
        body.campaign = campaignDoc._id;
      }
    }

    if (body.photo === "" || body.photo === null) delete body.photo;
    if (body.proof_screenshot === "" || body.proof_screenshot === null) delete body.proof_screenshot;

    const doc = new Model(body);
    await doc.save();

    const obj = doc.toObject();
    obj.id = obj._id.toString();

    res.status(201).json(obj);
  } catch (error) {
    next(error);
  }
}

async function updateSubmission(req, res, next) {
  try {
    const { resource, id } = req.params;
    const Model = getModel(resource);
    if (!Model) {
      return res.status(404).json({ success: false, message: `Resource ${resource} not found` });
    }

    const body = { ...req.body };
    await resolveBodyUrls(body);

    // Sync status field for volunteer/sokkhom applications
    if (body.status) {
      body.application_status = body.status;
      if (body.status === "approved") {
        body.status = "published";
      } else if (body.status === "pending" || body.status === "under_review") {
        body.status = "pending_review";
      }
      // "rejected" is valid in both Mongoose schema and application status
    }

    if (req.user) {
      body.updated_by = req.user._id;
      if (resource === "donation-requests") {
        body.verified_by = req.user._id;
      }
    }

    const doc = await Model.findByIdAndUpdate(id, body, { new: true });
    if (!doc) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    const obj = doc.toObject();
    obj.id = obj._id.toString();

    if (obj.application_status) {
      obj.status = obj.application_status;
    }

    res.json(obj);
  } catch (error) {
    next(error);
  }
}

async function deleteSubmission(req, res, next) {
  try {
    const { resource, id } = req.params;
    const Model = getModel(resource);
    if (!Model) {
      return res.status(404).json({ success: false, message: `Resource ${resource} not found` });
    }

    const doc = await Model.findByIdAndDelete(id);
    if (!doc) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSubmissions,
  getSubmissionById,
  createSubmission,
  updateSubmission,
  deleteSubmission,
};
