import { updateAccountName } from '@/repositories/accountRepository';
import type { Account } from '@/types';

export async function renameAccount(accountId: string, name: string): Promise<Account> {
  return updateAccountName(accountId, name);
}
