//import { child$, children$, VirtualDOM } from '@youwol/flux-view'
import { child$, children$, Stream$, VirtualDOM } from '@youwol/flux-view'
import { BehaviorSubject, combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'



export namespace Select {

    export class ItemData{

        constructor(public readonly id: string, public readonly name: string ){}
    }

    export class State {

        public readonly selectionId$: BehaviorSubject<string>
        public readonly items$: Observable<Array<ItemData>>
        public readonly selection$ : Observable<ItemData>

        constructor(
            items: Observable<Array<ItemData>> | Array<ItemData>,
            selectionId: BehaviorSubject<string> | string
        ) {
            this.selectionId$ = (selectionId instanceof BehaviorSubject) 
                ? selectionId 
                : new BehaviorSubject<string>(selectionId)

            this.items$ = (items instanceof Observable) ? items : new BehaviorSubject<Array<ItemData>>(items)

            this.selection$ = combineLatest([this.selectionId$,this.items$]).pipe(
                map( ([itemId, items]) =>{
                    return items.find( item => item.id == itemId) 
                })
            )
        }
    }


    export class View implements VirtualDOM {        

        public readonly state: State
        public readonly tag = 'select'
        public readonly children: Stream$< [ItemData, Array<ItemData>], Array<VirtualDOM> >

        onchange = (ev) => {            
            let option = Array.from(ev.target).find( option => option['selected'] )
            this.state.selectionId$.next(option['value']) 
        }

        constructor( {state, ...rest} : { state: State }) {

            Object.assign(this, rest)

            this.state = state
            let data$ = combineLatest( [this.state.selection$, this.state.items$])
            
            this.children = children$(data$, ([selection, items]) => {
                return items.map( (item,i) =>({ 
                    tag: 'option', 
                    selected: selection && selection.id == item.id ? 'selected' : undefined,
                    value: item.id, 
                    innerText: item.name
                })) 
            })
        }
    }
}