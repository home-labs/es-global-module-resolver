export { };


declare global {

    export class TestModule {

        printExampleMessage(): string;

    }

}


globalThis.TestModule = () => {

    this.printExampleMessage = (): string => {
        console.log(`This is a example of message.`);
    }

}
