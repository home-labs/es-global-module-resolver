import { IESTestModule } from './i-es-test-module';


// export default class ESTestModule implements IESTestModule {
export class ESTestModule implements IESTestModule {

    printATestMessage() {
        console.log(`The module ${this.constructor.name} was correctly loaded. That is a printed message by one of its instance methods.`);
    }

}
