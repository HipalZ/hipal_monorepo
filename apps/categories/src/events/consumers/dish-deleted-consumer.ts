import { Message } from 'node-nats-streaming';
import { Subjects, Listener, DishDeletedEvent } from '@hipal/common';
import { Category } from '../../models/category';
import { Dish } from '../../models/dish';
import { queueGroupName } from './queue-group-name';

export class DishDeletedConsumer extends Listener<DishDeletedEvent> {
  readonly subject = Subjects.DishDeleted;
  queueGroupName = queueGroupName;

  async onMessage(data: DishDeletedEvent['data'], msg: Message) {
    try {
      const {
        id
      } = data;
  
      const dish = await Dish.findById(id);
  
      if (dish) {
        const dishMatch = {
          name: dish.name,
          id: dish.id,
        };
        const categories = await Category.find({
          dishes: {
            $elemMatch: dishMatch,
          },
        })
        for (const category of categories) {
          category.dishes.splice(
            category.dishes.map((dish: any) => { return dish.id }).indexOf(id), 1
          );
          await category.save();
        }
        await Dish.findByIdAndDelete(id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      msg.ack();
    }
  }
}
