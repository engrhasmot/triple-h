import mongoose, { Schema, Document, Model } from 'mongoose';

export type FoundationRecommendation =
  | 'isolated-footing'
  | 'combined-footing'
  | 'raft-foundation'
  | 'pile-foundation';

export interface ISoilLayer {
  depthFrom: number;
  depthTo: number;
  soilType: string;
  nValue: number;
  allowableBearing: number;
}

export interface ISoilTest extends Document {
  projectName: string;
  location?: string;
  date: Date;
  boreholeNo?: string;
  boreholeDepth?: number;
  layers: ISoilLayer[];
  groundwaterDepth?: number;
  recommendedFoundation?: FoundationRecommendation;
  recommendedPileDepth?: number;
  safeAllowableBearing?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

function nValueToAllowableBearing(n: number): number {
  if (n < 5) return 0.5;
  if (n <= 10) return 1.0;
  if (n <= 20) return 1.5;
  if (n <= 30) return 2.0;
  if (n <= 50) return 3.0;
  return 4.5;
}

function getFoundationRecommendation(bearing: number): FoundationRecommendation {
  if (bearing >= 3.0) return 'isolated-footing';
  if (bearing >= 1.5) return 'raft-foundation';
  if (bearing >= 1.0) return 'raft-foundation';
  return 'pile-foundation';
}

const SoilLayerSchema = new Schema<ISoilLayer>(
  {
    depthFrom: { type: Number, required: true },
    depthTo: { type: Number, required: true },
    soilType: { type: String, trim: true },
    nValue: { type: Number, min: 0, max: 100 },
    allowableBearing: { type: Number },
  },
  { _id: false }
);

const SoilTestSchema = new Schema<ISoilTest>(
  {
    projectName: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      index: true,
    },
    location: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Test date is required'],
      index: true,
    },
    boreholeNo: {
      type: String,
      trim: true,
    },
    boreholeDepth: {
      type: Number,
    },
    layers: [SoilLayerSchema],
    groundwaterDepth: {
      type: Number,
    },
    recommendedFoundation: {
      type: String,
      enum: [
        'isolated-footing',
        'combined-footing',
        'raft-foundation',
        'pile-foundation',
      ],
    },
    recommendedPileDepth: {
      type: Number,
    },
    safeAllowableBearing: {
      type: Number,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

SoilTestSchema.pre('save', function (next) {
  try {
    if (this.layers && this.layers.length > 0) {
      this.layers.forEach((layer) => {
        layer.allowableBearing = nValueToAllowableBearing(Number(layer.nValue) || 0);
      });

      const deepLayers = this.layers.filter((l) => Number(l.depthFrom) >= 10);
      const candidateLayers = deepLayers.length > 0 ? deepLayers : this.layers;
      const bearings = candidateLayers.map((l) => l.allowableBearing).filter((b) => typeof b === 'number' && !isNaN(b));
      const minBearing = bearings.length > 0 ? Math.min(...bearings) : 1.0;

      this.safeAllowableBearing = minBearing;
      this.recommendedFoundation = getFoundationRecommendation(minBearing);
    }
    next();
  } catch (err: any) {
    next(err);
  }
});

SoilTestSchema.index({ date: -1 });

const SoilTest: Model<ISoilTest> =
  mongoose.models.SoilTest || mongoose.model<ISoilTest>('SoilTest', SoilTestSchema);

export default SoilTest;
