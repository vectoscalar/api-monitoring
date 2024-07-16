import mongoose, { Document, Schema } from 'mongoose';

export interface IAPILog extends Document {
    endpointId: mongoose.Types.ObjectId;
    microserviceId: mongoose.Types.ObjectId;
    projectId: mongoose.Types.ObjectId;
    organizationId: mongoose.Types.ObjectId;
    timestamp: Date;
    responseTime: number;
    isSuccessfull: boolean;
    statusCode: number;
    errorMessage?: string;
    ipAddress: string;
    createdAt: Date;
}

const apiLogSchema = new Schema({
    endpointId: { type: Schema.Types.ObjectId, required: true },
    microserviceId: { type: Schema.Types.ObjectId, required: true },
    projectId: { type: Schema.Types.ObjectId, required: true },
    organizationId: { type: Schema.Types.ObjectId, required: true },
    timestamp: { type: Date, default: Date.now },
    responseTime: { type: Number, required: true },
    isSuccessfull: { type: Boolean, required: true },
    statusCode: { type: Number },
    errorMessage: { type: String },
    ipAddress: { type: String, required: true },
}, {
    timestamps: true
});

apiLogSchema.index({ endpointId: 1, timestamp: -1 });
apiLogSchema.index({ ipAddress: 1 });

export const APILogModel = mongoose.model<IAPILog>('APILog', apiLogSchema);
