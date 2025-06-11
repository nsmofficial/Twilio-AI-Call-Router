import { prisma } from '@/lib/prisma';
import type { Call as PrismaCall, Prisma } from '@prisma/client';

export type Call = PrismaCall;

export const callService = {
  /**
   * Creates a new call record in the database.
   * @param {string} callSid - The Twilio Call SID.
   * @param {string} fromNumber - The number the call is from.
   * @param {string} toNumber - The number the call is to.
   * @returns {Promise<Call>} The newly created call record.
   */
  createCall: async (callSid: string, fromNumber: string, toNumber: string): Promise<Call> => {
    return prisma.call.create({
      data: {
        callSid,
        fromNumber,
        toNumber,
        status: 'initiated',
      },
    });
  },

  /**
   * Updates a call record with new information.
   * @param {string} callSid - The Twilio Call SID to identify the call.
   * @param {object} data - The data to update.
   * @returns {Promise<Call>} The updated call record.
   */
  updateCall: async (callSid: string, data: Prisma.CallUpdateInput): Promise<Call> => {
    return prisma.call.update({
      where: { callSid },
      data,
    });
  },

  /**
   * Finds a call by its Twilio Call SID.
   * @param {string} callSid - The Twilio Call SID.
   * @returns {Promise<Call | null>} The found call record.
   */
  getCallBySid: async (callSid: string): Promise<Call | null> => {
    return prisma.call.findUnique({
      where: { callSid },
    });
  },

  /**
   * Returns a list of all calls, newest first.
   * @returns {Promise<Call[]>} The full list of call records.
   */
  listCalls: async (): Promise<Call[]> => {
    return prisma.call.findMany({
      orderBy: { createdAt: 'desc' },
      include: { agent: true }, // Include the agent details in the result
    });
  },
}; 