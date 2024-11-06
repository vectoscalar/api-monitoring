import mongoose, { Types } from "mongoose";

import { MicroserviceDAO} from '../dao';
import { logger } from "../common/services";


export class MicroServiceService {
  private microserviceDAO: MicroserviceDAO;

  constructor() {
    this.microserviceDAO = new MicroserviceDAO();
  }


  /**
   * Method to handle batch processing and update hostnames in microservices table.
   * 
   * @param {Array} batch - An array of objects with microserviceId and hostName
   * Example: [{ microserviceId: '1', hostName: 'a' }, { microserviceId: '1', hostName: 'b' }]
   * 
   */
  async updateHostNames(batch) {
    const hostnamesSet = new Set();

    batch.forEach(({ hostname }) => {
      hostnamesSet.add(hostname);
    });

    const microserviceId = batch[0].microserviceId;

    logger.info("RequestLogManager -> updateHostNames: Hostnames Set", [...hostnamesSet]);

    const updateBody = {
      filter: { _id: new mongoose.Types.ObjectId(String(microserviceId)) },
      update: { $addToSet: { hostNames: { $each: [...hostnamesSet] } } }, // Use $each to add multiple hostNames, no duplicates
    }

    try {
      const result = await this.microserviceDAO.updateOne(updateBody);

      logger.info('RequestLogManager -> updateHostNames: Bulk update successful:', result);
    } catch (error) {
      logger.error('Error performing bulk update:', error);
    }
  };
}
