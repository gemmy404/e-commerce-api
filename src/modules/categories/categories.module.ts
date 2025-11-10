import {Module} from '@nestjs/common';
import {CategoriesService} from './categories.service';
import {CategoriesController} from './categories.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {Category, CategorySchema} from "./schemas/category.schema";
import {CategoriesMapper} from "./categories.mapper";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Category.name, schema: CategorySchema},
        ]),
    ],
    controllers: [CategoriesController],
    providers: [CategoriesService, CategoriesMapper],
    exports: [CategoriesService],
})
export class CategoriesModule {
}
