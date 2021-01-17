import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
   income: number;
   outcome: number;
   total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
   public async getBalance(): Promise<Balance> {

      const transactions = await this.find()

      const balance = transactions.reduce((accumulate, item) => {

         accumulate[item.type] += item.value

         if ("income" === item.type)
            accumulate.total += item.value

         else if ("outcome" === item.type)
            accumulate.total -= item.value

         return accumulate

      }, {
         income: 0,
         outcome: 0,
         total: 0
      })

      return balance
   }
}

export default TransactionsRepository;
