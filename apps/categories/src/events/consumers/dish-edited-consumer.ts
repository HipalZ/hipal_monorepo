import { Message } from 'node-nats-streaming';
import { Subjects, Listener, DishEditedEvent } from '@hipal/common';
import { Category } from '../../models/category';
import { Dish } from '../../models/dish';
import { queueGroupName } from './queue-group-name';

export class DishEditedConsumer extends Listener<DishEditedEvent> {
  readonly subject = Subjects.DishEdited;
  queueGroupName = queueGroupName;

  async onMessage(data: DishEditedEvent['data'], msg: Message) {
    try {
      const {
        id,
        name,
        businessId,
        categories
  
      } = data;
  
      const dish = await Dish.findById(id);
  
      if (dish) {
        const dishMatch = {
          name: dish.name,
          id: dish.id
    
        };
        const currentCategories = await Category.find({
          businessId,
          dishes: {
            $elemMatch: dishMatch,
          },
        });
        const updatedCategoryIds = categories.map((category:any) => { return category.id });
        const currentCategoryIds = currentCategories.map((category: any) => { return category.id });
        // Dish name is changed
        if (dish.name !== name) {
          for (const category of currentCategories) {
            const index = category.dishes.map((dish: any) => { return dish.id }).indexOf(id);
            category.dishes[index] = {
              name,
              id,
         
            };
            await category.save();
          }
          dish.name = name;
          dish.businessId = businessId;
          await dish.save();
        }
        // New categories have been added to dish
        const newCategoryIds = updatedCategoryIds.filter((id) => { return !currentCategoryIds.includes(id) });
        for (const newCategoryId of newCategoryIds) {
          const newCategory = await Category.findById(newCategoryId);
          newCategory?.dishes.push({
            id,
            name,
      
          });
          await newCategory?.save();
        }
        // Some categories were removed from dish
        const removedCategoryIds = currentCategoryIds.filter((id) => { return !updatedCategoryIds.includes(id) });
        for (const removedCategoryId of removedCategoryIds) {
          const removedCategory = await Category.findById(removedCategoryId);
          removedCategory?.dishes.splice(
            removedCategory?.dishes.map((dish: any) => { return dish.id }).indexOf(id), 1
          );
          await removedCategory?.save();
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      msg.ack();
    }
  }
}
