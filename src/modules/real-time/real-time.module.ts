import {Module} from '@nestjs/common';
import {RealTimeService} from './real-time.service';
import {RealTimeController} from './real-time.controller';

@Module({
    controllers: [RealTimeController],
    providers: [RealTimeService],
    exports: [RealTimeService],
})
export class RealTimeModule {
}
