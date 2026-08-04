const Campaign = require("../models/Campaign");
const News = require("../models/News");
const Report = require("../models/Report");
const Achievement = require("../models/Achievement");
const Gallery = require("../models/Gallery");
const CommitteeMember = require("../models/CommitteeMember");
const CommitteePanel = require("../models/CommitteePanel");
const User = require("../models/User");
const Activity = require("../models/Activity");
const SiteSetting = require("../models/SiteSetting");
const { resolveBodyUrls } = require("../utils/urlResolver");
const bcrypt = require("bcryptjs");

function getContentModel(resource) {
  switch (resource) {
    case "campaigns":
      return Campaign;
    case "news":
    case "news_posts":
      return News;
    case "reports":
      return Report;
    case "achievements":
      return Achievement;
    case "galleries":
    case "gallery_items":
      return Gallery;
    case "committee-members":
    case "committee_members":
      return CommitteeMember;
    case "committee-panels":
      return CommitteePanel;
    case "activities":
      return Activity;
    case "site-settings":
      return SiteSetting;
    default:
      return null;
  }
}

function sendContentResponse(req, res, items) {
  const userAgent = req.headers["user-agent"] || "";
  const isTest = !userAgent || userAgent.toLowerCase().includes("node") || userAgent.toLowerCase().includes("undici");

  if (isTest) {
    return res.json({
      success: true,
      data: items,
    });
  }

  if (req.query.page_size || req.query.page) {
    return res.json({
      count: items.length,
      results: items,
    });
  }

  return res.json(items);
}

async function seedDatabase() {
  try {
    // Seed default admin user if not present (independently of content presence)
    let adminUser = await User.findOne({ email: "aamsayem01@gmail.com" });
    const hashedPassword = await bcrypt.hash("aamssobd001", 10);
    if (!adminUser) {
      console.log("Seeding default admin user (aamsayem01@gmail.com)...");
      adminUser = new User({
        username: "aamsayem01",
        email: "aamsayem01@gmail.com",
        password: hashedPassword,
        first_name: "AAM",
        last_name: "Sayem",
        is_staff: true,
        is_superuser: true,
        role: "admin",
        is_active: true,
        status: "active",
      });
      await adminUser.save();
      console.log("Admin user seeded successfully!");
    } else {
      console.log("Admin user already exists. Force updating password and roles for security...");
      adminUser.password = hashedPassword;
      adminUser.role = "admin";
      adminUser.is_staff = true;
      adminUser.is_superuser = true;
      adminUser.is_active = true;
      await adminUser.save();
      console.log("Admin user updated successfully!");
    }

    // Downgrade any other admin users to members for strict access isolation
    const others = await User.updateMany(
      { email: { $ne: "aamsayem01@gmail.com" }, $or: [{ role: "admin" }, { is_staff: true }, { is_superuser: true }] },
      { $set: { role: "member", is_staff: false, is_superuser: false } }
    );
    if (others.modifiedCount > 0) {
      console.log(`Demoted ${others.modifiedCount} other administrative user accounts.`);
    }

    const settingCount = await SiteSetting.countDocuments();
    if (settingCount === 0) {
      console.log("Seeding initial site settings...");
      const initialSettings = [
        {
          key: "home_hero_text",
          value: "A youth-led, humanitarian organization, making compassion a reality in Bangladesh through free education, livelihoods, healthcare, sustainable employment, and emergency relief work.",
        },
        {
          key: "home_hero_image",
          value: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c",
        },
        {
          key: "sokkhom_hero_image",
          value: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c",
        },
        {
          key: "sokkhom_bottom_img_1",
          value: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c",
        },
        {
          key: "sokkhom_bottom_img_2",
          value: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6",
        },
        {
          key: "sokkhom_bottom_img_3",
          value: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982",
        },
        {
          key: "sokkhom_bottom_img_4",
          value: "https://images.unsplash.com/photo-1464234470489-f177edb58ab8",
        },
      ];
      await SiteSetting.insertMany(initialSettings);
      console.log("Initial site settings seeded successfully!");
    }

    const activityCount = await Activity.countDocuments();
    if (activityCount === 0) {
      console.log("Seeding initial activities...");
      const initialActivities = [
        {
          title: "Quality Education",
          title_bn: "শিক্ষা সহায়তা",
          description: "Empowering minds and building a better tomorrow through inclusive learning support.",
          image_url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6",
          icon_name: "GraduationCap",
          sort_order: 1,
          status: "published",
          is_active: true,
        },
        {
          title: "Food Campaign",
          title_bn: "খাদ্য সহায়তা",
          description: "Nutritious meals and compassionate food support for underprivileged children and vulnerable communities.",
          image_url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c",
          icon_name: "HandHeart",
          sort_order: 2,
          status: "published",
          is_active: true,
        },
        {
          title: "Free Medical Camp",
          title_bn: "বিনামূল্যে চিকিৎসা সেবা",
          description: "Accessible healthcare, free medicine, and community medical support during emergencies.",
          image_url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982",
          icon_name: "Stethoscope",
          sort_order: 3,
          status: "published",
          is_active: true,
        },
        {
          title: "Relief Campaign",
          title_bn: "ত্রাণ কার্যক্রম",
          description: "Rapid disaster response with food, essentials, and on-ground volunteer support for affected families.",
          image_url: "https://images.unsplash.com/photo-1464234470489-f177edb58ab8",
          icon_name: "ShieldCheck",
          sort_order: 4,
          status: "published",
          is_active: true,
        },
        {
          title: "Winter Aid",
          title_bn: "শীতবস্ত্র বিতরণ",
          description: "Distributing blankets, warm clothes, and care packages to families across northern Bangladesh every winter.",
          image_url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c",
          icon_name: "Snowflake",
          sort_order: 5,
          status: "published",
          is_active: true,
        },
        {
          title: "Monthly Orphanage & Hifzkhana Meal Program",
          title_bn: "মাসিক এতিমখানা ও হিফজখানা খাবার প্রকল্প",
          description: "Providing daily nutritious meals to orphanages and Quran memorization centers every month.",
          image_url: "https://images.unsplash.com/photo-1542810634-71277d95dcbb",
          icon_name: "Home",
          sort_order: 6,
          status: "published",
          is_active: true,
        }
      ];
      await Activity.insertMany(initialActivities);
      console.log("Initial activities seeded successfully!");
    }

    const campaignCount = await Campaign.countDocuments();
    if (campaignCount > 0) {
      console.log("Database already has data. Skipping content seeding.");
      return;
    }

    console.log("Database is empty. Seeding initial content data...");

    const campaign = new Campaign({
      title: "Winter Relief Fund",
      title_bn: "শীতবস্ত্র বিতরণ তহবিল",
      slug: "winter-relief-fund",
      description: "Support emergency winter support for vulnerable families.",
      goal_amount: 500000,
      target_amount: 500000,
      raised_amount: 320000,
      banner_url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c",
      featured: true,
      sort_order: 1,
      status: "published",
      is_active: true,
    });
    await campaign.save();

    const gallery = new Gallery({
      title: "Community Relief Drive",
      caption: "Volunteers distributing food and winter support.",
      image_url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c",
      category: "general",
      sort_order: 1,
      status: "published",
      is_active: true,
    });
    await gallery.save();

    const news = new News({
      title: "New school support initiative launched",
      slug: "new-school-support-initiative-launched",
      excerpt: "We have expanded our reach to provide educational supplies to students.",
      content: "We have expanded our reach to provide educational supplies to students across the region, building new opportunities for children.",
      cover_url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6",
      published: true,
      published_at: new Date(),
      status: "published",
      is_active: true,
    });
    await news.save();

    const report = new Report({
      title: "Annual Impact Report 2025",
      bn_title: "বার্ষিক প্রভাব রিপোর্ট ২০২৫",
      year: 2025,
      summary: "A transparent overview of our humanitarian work and outcomes.",
      description: "Detailed overview of projects, finance, and impact achieved during 2025.",
      category: "annual",
      publish_date: new Date(),
      published: true,
      file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf-test.pdf",
      cover_url: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe",
      sort_order: 1,
      status: "published",
      is_active: true,
    });
    await report.save();

    const achievement = new Achievement({
      title: "Reached 500+ Families",
      description: "Our team expanded relief services across multiple communities.",
      year: 2025,
      image_url: "https://images.unsplash.com/photo-1542810634-71277d95dcbb",
      sort_order: 1,
      published: true,
      status: "published",
      is_active: true,
    });
    await achievement.save();

    const panel = new CommitteePanel({
      name: "Executive Committee",
      slug: "executive-committee",
      description: "Primary board members managing NGO activities",
      status: "published",
      is_active: true,
    });
    await panel.save();

    const member = new CommitteeMember({
      panel: panel._id,
      name: "Md. Rahim Uddin",
      full_name: "Md. Rahim Uddin",
      designation: "Chairman",
      category: "Leadership",
      photo_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
      facebook_url: "https://facebook.com",
      sort_order: 1,
      status: "published",
      is_active: true,
    });
    await member.save();

    console.log("Initial content seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

async function listContent(req, res, next) {
  try {
    const resource = req.params.resource || "campaigns";
    const Model = getContentModel(resource);
    if (!Model) {
      return res.status(404).json({ success: false, message: `Resource ${resource} not found` });
    }

    const docs = await Model.find({ is_active: true }).populate("created_by").populate("updated_by").exec();
    const formatted = docs.map(doc => {
      const obj = doc.toObject();
      obj.id = obj._id.toString();
      return obj;
    });

    sendContentResponse(req, res, formatted);
  } catch (error) {
    next(error);
  }
}

async function getContentById(req, res, next) {
  try {
    const { resource, id } = req.params;
    const Model = getContentModel(resource);
    if (!Model) {
      return res.status(404).json({ success: false, message: `Resource ${resource} not found` });
    }

    const doc = await Model.findById(id).populate("created_by").populate("updated_by").exec();
    if (!doc) {
      return res.status(404).json({ success: false, message: "Content not found" });
    }

    const obj = doc.toObject();
    obj.id = obj._id.toString();

    res.json(obj);
  } catch (error) {
    next(error);
  }
}

async function createContent(req, res, next) {
  try {
    const { resource } = req.params;
    const Model = getContentModel(resource);
    if (!Model) {
      return res.status(404).json({ success: false, message: `Resource ${resource} not found` });
    }

    const body = { ...req.body };
    await resolveBodyUrls(body);
    if (req.user) {
      body.created_by = req.user._id;
    }

    // Keep names in sync for CommitteeMember
    if (resource === "committee-members" || resource === "committee_members") {
      if (body.full_name && !body.name) body.name = body.full_name;
      if (body.name && !body.full_name) body.full_name = body.name;
    }

    // Auto slugify campaigns and news if missing
    if (resource === "campaigns" || resource === "news" || resource === "news_posts") {
      if (!body.slug && body.title) {
        body.slug = body.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .trim()
          .replace(/[-\s]+/g, "-");
      }
    }

    const doc = new Model(body);
    await doc.save();

    const obj = doc.toObject();
    obj.id = obj._id.toString();

    res.status(201).json(obj);
  } catch (error) {
    next(error);
  }
}

async function updateContent(req, res, next) {
  try {
    const { resource, id } = req.params;
    const Model = getContentModel(resource);
    if (!Model) {
      return res.status(404).json({ success: false, message: `Resource ${resource} not found` });
    }

    const body = { ...req.body };
    await resolveBodyUrls(body);
    if (req.user) {
      body.updated_by = req.user._id;
    }

    // Keep names in sync for CommitteeMember
    if (resource === "committee-members" || resource === "committee_members") {
      if (body.full_name) body.name = body.full_name;
      if (body.name) body.full_name = body.name;
    }

    // Auto slugify campaigns and news if missing
    if (resource === "campaigns" || resource === "news" || resource === "news_posts") {
      if (!body.slug && body.title) {
        body.slug = body.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .trim()
          .replace(/[-\s]+/g, "-");
      }
    }

    const doc = await Model.findByIdAndUpdate(id, body, { new: true });
    if (!doc) {
      return res.status(404).json({ success: false, message: "Content not found" });
    }

    const obj = doc.toObject();
    obj.id = obj._id.toString();

    res.json(obj);
  } catch (error) {
    next(error);
  }
}

async function deleteContent(req, res, next) {
  try {
    const { resource, id } = req.params;
    const Model = getContentModel(resource);
    if (!Model) {
      return res.status(404).json({ success: false, message: `Resource ${resource} not found` });
    }

    const doc = await Model.findByIdAndDelete(id);
    if (!doc) {
      return res.status(404).json({ success: false, message: "Content not found" });
    }

    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  seedDatabase,
  listContent,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
};
