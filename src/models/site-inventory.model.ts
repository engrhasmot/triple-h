import mongoose, { Schema, Document, Model } from 'mongoose';

export type InventoryItemType = 'cement' | 'rod' | 'sand' | 'brick' | 'stone-chips' | 'paint' | 'tile' | 'other';
export type InventoryUnit = 'bag' | 'ton' | 'cft' | 'sft' | 'nos' | 'liter' | 'kg' | 'other';

export interface ISiteInventory extends Document {
  projectName: string;
  itemType: InventoryItemType;
  itemLabel?: string;
  challanNo?: string;
  supplier?: string;
  quantity: number;
  unit: InventoryUnit;
  usedQuantity: number;
  deliveryDate: Date;
  notes?: string;
  stockQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}

const SiteInventorySchema = new Schema<ISiteInventory>(
  {
    projectName: { type: String, required: [true, 'Project name is required'], trim: true, index: true },
    itemType: {
      type: String,
      required: [true, 'Item type is required'],
      enum: ['cement', 'rod', 'sand', 'brick', 'stone-chips', 'paint', 'tile', 'other'],
      index: true,
    },
    itemLabel: { type: String, trim: true },
    challanNo: { type: String, trim: true },
    supplier: { type: String, trim: true },
    quantity: { type: Number, required: [true, 'Quantity is required'], min: [0, 'Quantity cannot be negative'] },
    unit: { type: String, enum: ['bag', 'ton', 'cft', 'sft', 'nos', 'liter', 'kg', 'other'], default: 'nos' },
    usedQuantity: { type: Number, default: 0, min: [0, 'Used quantity cannot be negative'] },
    deliveryDate: { type: Date, required: [true, 'Delivery date is required'], default: Date.now, index: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

SiteInventorySchema.virtual('stockQuantity').get(function (this: ISiteInventory) {
  return (this.quantity || 0) - (this.usedQuantity || 0);
});

SiteInventorySchema.index({ deliveryDate: -1, itemType: 1 });

const SiteInventory: Model<ISiteInventory> =
  mongoose.models.SiteInventory || mongoose.model<ISiteInventory>('SiteInventory', SiteInventorySchema);

export default SiteInventory;
