import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMaterialEstimate extends Document {
  estimateNumber: string;
  clientName: string;
  clientPhone?: string;
  projectTitle: string;
  slabArea: number; // in sqft
  floors: number;
  totalBuiltArea: number;
  buildingType: string;
  unitRates: {
    rodPerKg: number;
    cementPerBag: number;
    coarseSandPerCft: number;
    localSandPerCft: number;
    aggregatePerCft: number;
    brickPerPcs: number;
  };
  quantities: {
    rodKg: number;
    rodTons: number;
    rod16mmKg: number;
    rod12mmKg: number;
    rod10mmKg: number;
    rod8mmKg: number;
    cementBags: number;
    cementCastingBags: number;
    cementMasonryBags: number;
    coarseSandCft: number;
    localSandCft: number;
    aggregateCft: number;
    bricksCount: number;
  };
  costs: {
    rodCost: number;
    cementCost: number;
    sandCost: number;
    aggregateCost: number;
    brickCost: number;
    totalMaterialCost: number;
    costPerSqft: number;
  };
  note?: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MaterialEstimateSchema = new Schema<IMaterialEstimate>(
  {
    estimateNumber: { type: String, required: true, unique: true, index: true },
    clientName: { type: String, required: true, trim: true },
    clientPhone: { type: String, trim: true },
    projectTitle: { type: String, required: true, trim: true },
    slabArea: { type: Number, required: true, min: 1 },
    floors: { type: Number, required: true, min: 1 },
    totalBuiltArea: { type: Number, required: true },
    buildingType: { type: String, default: "residential" },
    unitRates: {
      rodPerKg: { type: Number, default: 96 },
      cementPerBag: { type: Number, default: 540 },
      coarseSandPerCft: { type: Number, default: 55 },
      localSandPerCft: { type: Number, default: 35 },
      aggregatePerCft: { type: Number, default: 140 },
      brickPerPcs: { type: Number, default: 12.5 },
    },
    quantities: {
      rodKg: Number,
      rodTons: Number,
      rod16mmKg: Number,
      rod12mmKg: Number,
      rod10mmKg: Number,
      rod8mmKg: Number,
      cementBags: Number,
      cementCastingBags: Number,
      cementMasonryBags: Number,
      coarseSandCft: Number,
      localSandCft: Number,
      aggregateCft: Number,
      bricksCount: Number,
    },
    costs: {
      rodCost: Number,
      cementCost: Number,
      sandCost: Number,
      aggregateCost: Number,
      brickCost: Number,
      totalMaterialCost: Number,
      costPerSqft: Number,
    },
    note: { type: String },
    createdBy: { type: String, default: "Admin" },
  },
  { timestamps: true }
);

const MaterialEstimate: Model<IMaterialEstimate> =
  mongoose.models.MaterialEstimate ||
  mongoose.model<IMaterialEstimate>("MaterialEstimate", MaterialEstimateSchema);

export default MaterialEstimate;
