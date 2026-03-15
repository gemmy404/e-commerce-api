import {Controller, Sse} from '@nestjs/common';
import {RealTimeService} from './real-time.service';
import {map, Observable} from "rxjs";

@Controller('api/v1/realtime')
export class RealTimeController {

    constructor(private readonly realTimeService: RealTimeService) {
    }

    @Sse('stream')
    streamEvents(): Observable<MessageEvent> {
        return this.realTimeService.allUpdates$().pipe(
            map((payload) => ({
                data: payload,
            } as MessageEvent)),
        );
    }

}
