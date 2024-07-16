import Joi from "joi";

export const requestLogSchema = Joi.object({
  organizationId: Joi.string().required(),
  microserviceId: Joi.string().required(),
  projectId: Joi.string().required(),
  url: Joi.string().uri().required(),
  version: Joi.string().optional(),
  method: Joi.string().required(),
  description: Joi.string().optional(),
  statusCode: Joi.number().required(),
  isSuccessfull: Joi.boolean().required(),
  errorMessage: Joi.string().allow(null),
}).required();
