export { };


declare global {

    interface Number {

        addedMethodExample(): void;

    }

}

Number.prototype.addedMethodExample = function (): void {
    console.log(`A new method has been added to Number class.`);
};
