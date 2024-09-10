import Joi from "joi";

export const requestLogSchema = Joi.object({
  organizationId: Joi.string().required(),
  microserviceId: Joi.string().required(),
  projectId: Joi.string().required(),
  url: Joi.string().uri({ relativeOnly: true }).required(),
  method: Joi.string().required(),
  routerUrl: Joi.string().required(),
  description: Joi.string().optional(),
  statusCode: Joi.number().required(),
  isSuccessfull: Joi.boolean().required(),
  errorDetails: Joi.string().allow(null),
  responseTime: Joi.number().required(),
  ipAddress: Joi.string().required(),
}).required();
