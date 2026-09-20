import { z } from 'zod';
import { paginationQuerySchema } from '../../common/helpers/pagination.helper.js';
import { VAULT_OCCASION_NAME_MAX_LENGTH } from './vault.constants.js';

/**
 * 🗄️ VAULT VALIDATION SCHEMAS (ZOD)
 * Strictly validates incoming request params, query filters, and mutation payloads for Vault endpoints.
 */

export const vaultIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid vault item ID format. Must be a valid UUID.'),
  }),
});

export const getVaultItemsQuerySchema = z.object({
  query: paginationQuerySchema.extend({
    search: z.string().trim().max(100, 'Search keyword cannot exceed 100 characters').optional(),
  }),
});

export const updateVaultItemSchema = z.object({
  body: z.object({
    occasionName: z
      .string({ required_error: 'Occasion name is required' })
      .trim()
      .min(1, 'Occasion name cannot be empty')
      .max(
        VAULT_OCCASION_NAME_MAX_LENGTH,
        `Occasion name cannot exceed ${VAULT_OCCASION_NAME_MAX_LENGTH} characters`
      ),
  }),
});

export const bulkDeleteVaultItemsSchema = z.object({
  body: z.object({
    ids: z
      .array(z.string().uuid('Each item ID must be a valid UUID format'))
      .min(1, 'At least 1 item ID must be provided'),
  }),
});
