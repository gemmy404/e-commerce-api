import {Module} from '@nestjs/common';
import {ProductsService} from './products.service';
import {ProductsController} from './products.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {Product, ProductsSchema} from "./schemas/products.schema";
import {ProductsMapper} from "./products.mapper";
import {StoreSetting, StoreSettingSchema} from "../admin/schemas/store-settings.schema";
import {SubCategory, SubCategorySchema} from "../sub-categories/schemas/sub-category.schema";
import {CloudinaryModule} from "../cloudinary/cloudinary.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: Product.name, schema: ProductsSchema},
            {name: SubCategory.name, schema: SubCategorySchema},
            {name: StoreSetting.name, schema: StoreSettingSchema},
        ]),
        CloudinaryModule,
    ],
    controllers: [ProductsController],
    providers: [ProductsService, ProductsMapper],
    exports: [ProductsService]
})
export class ProductsModule {
}
