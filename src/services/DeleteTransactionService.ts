import AppError from '../errors/AppError';
import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
   id: string
}

class DeleteTransactionService {
   public async execute({ id }: Request): Promise<void> {

      const transactionsRepository = getCustomRepository(TransactionsRepository)

      const findID = await transactionsRepository.findOne({ where: { id } })

      if (!findID)
         throw new AppError("Não encontrado", 401)

      await transactionsRepository.delete(findID.id)

   }
}

export default DeleteTransactionService;
