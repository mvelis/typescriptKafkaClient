'use strict'
import { Schema, model, Document, Model } from 'mongoose'
import { ObjectId } from 'bson'

export const RefundSchema: Schema = new Schema(
  {
    id: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    metadata: {
      type: String,
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
  },
  { versionKey: false },
)

export interface RefundMongoDocument extends Document {
  _id: ObjectId
  id: string
  status: string
  orderId: string
  amount: number
  createdAt: Date
  updatedAt: Date
  metadata: string
}

export const RefundModel: Model<RefundMongoDocument> = model<RefundMongoDocument>('refund', RefundSchema)
