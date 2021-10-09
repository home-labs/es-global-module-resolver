import { ESTestModuleInterface } from './esTestModuleInterface';


// export default class ESTestModule implements ESTestModuleInterface {
export class ESTestModule implements ESTestModuleInterface {

    printATestMessage() {
        console.log(`The module ${this.constructor.name} was correctly loaded. That is a printed message by one of its instance methods.`);
    }

}
