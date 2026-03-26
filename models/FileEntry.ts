import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IFileEntry extends Document {
  driveUrl: string
  fileId: string
  fileName: string
  fileType: 'file' | 'folder'
  access: 'public' | 'private'
  allowedEmails: string[]
  deletePassword: string | null
  createdAt: Date
  updatedAt: Date
}

const FileEntrySchema = new Schema<IFileEntry>(
  {
    driveUrl: { type: String, required: true },
    fileId: { type: String, required: true },
    fileName: { type: String, required: true },
    fileType: { type: String, enum: ['file', 'folder'], required: true },
    access: { type: String, enum: ['public', 'private'], default: 'public' },
    allowedEmails: { type: [String], default: [] },
    deletePassword: { type: String, default: null },
  },
  { timestamps: true }
)

const FileEntry: Model<IFileEntry> =
  mongoose.models.FileEntry ||
  mongoose.model<IFileEntry>('FileEntry', FileEntrySchema)

export default FileEntry
