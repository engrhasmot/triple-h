import mongoose from 'mongoose';
import 'dotenv/config';

// Re-define schema to bypass Next.js imports in raw script
const planStatusSchema = new mongoose.Schema({
  fileId: { type: String, uppercase: true, trim: true, index: true },
  clientName: { type: String, required: true },
  phone: { type: String, required: true },
  projectTitle: { type: String, required: true },
  location: { type: String, required: true },
  currentStatus: { type: String, default: 'under-review' },
  statusHistory: [{ status: String, note: String, updatedBy: String, date: Date }],
  documents: Array,
  submissionDate: { type: Date, default: Date.now }
});

planStatusSchema.pre('validate', async function (next) {
  if (!this.fileId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('PlanStatus').countDocuments();
    this.fileId = `TH-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

const PlanStatus = mongoose.models.PlanStatus || mongoose.model('PlanStatus', planStatusSchema);

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    const plan = await PlanStatus.create({
      clientName: "Md. Shahin",
      phone: "01711223344",
      projectTitle: "Shahin Villa Rajuk Approval",
      location: "Uttara Sector 11, Dhaka",
      currentStatus: "under-review",
      statusHistory: [
        { status: "submitted", note: "File received at front desk.", updatedBy: "admin", date: new Date(Date.now() - 86400000 * 2) },
        { status: "under-review", note: "Forwarded to town planner for initial checking.", updatedBy: "engineer", date: new Date() }
      ]
    });
    
    console.log('Created Dummy Plan:', plan.fileId);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
