import {Injectable} from '@nestjs/common';
import {Observable, Subject} from "rxjs";

@Injectable()
export class RealTimeService {

    private stream$ = new Subject<{ event: string; data: any }>();

    emit(event: string, data: any) {
        this.stream$.next({event, data});
    }

    allUpdates$(): Observable<any> {
        return this.stream$.asObservable();
    }
}
