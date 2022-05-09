const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const paginate = require("./plugin/paginate.plugin");
const config = require("../config/config");
const slug = require("mongoose-slug-updater");
const tree = require("./plugin/tree.plugin");

const categorySchema = Schema(
  {
    title: { type: String },
    slug: { type: String, slug: ["title"] },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Categories",
      default: null,
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true, //CreatedAt & UpdatedAt
  }
);

categorySchema.plugin(paginate);
categorySchema.plugin(slug);
categorySchema.plugin(tree);

const Category = mongoose.model("Categories", categorySchema);
module.exports = Category;
