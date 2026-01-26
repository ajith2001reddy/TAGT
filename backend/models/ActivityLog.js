const ActivityLogSchema = new mongoose.Schema({
    action: String,
    performedBy: String,
    role: String
}, { timestamps: true });

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);
