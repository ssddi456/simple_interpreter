import { SevenBHMapMaker, SevenBHObject } from "../interpreter/interpreter_with_jump";


export default {
    data() {
        return {
            SevenBHMapMaker
        }
    },
    methods: {
        getCellClass(cell: SevenBHObject) {
            if (cell.type == SevenBHMapMaker.datacube) {
                return SevenBHMapMaker[SevenBHMapMaker.datacube];
            } else if (cell.type == SevenBHMapMaker.worker) {
                if (!cell.holds) {
                    return SevenBHMapMaker[SevenBHMapMaker.worker];
                } else {
                    return 'worker-with-datacube';
                }
            }

            return SevenBHMapMaker[cell.type];
        },
        getCellContent(cell: SevenBHObject) {
            if (cell.type == SevenBHMapMaker.datacube) {
                return cell.value;
            } else if (cell.type == SevenBHMapMaker.worker) {
                if (cell.holds) {
                    return cell.holds.value;
                }
            }
        },
    }
}