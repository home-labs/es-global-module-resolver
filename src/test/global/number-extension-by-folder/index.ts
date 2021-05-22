export { };

// declare global é usado para extender built-in interfaces, como Number, o que cria side-effects, para importar um módulo EcmaScript este deve ser retornado numa Promise<any> para ser retornado num top-level await
declare global {

    interface Number {

        addedMethodExample(): void;

    }

}

Number.prototype.addedMethodExample = function (): void {
    console.log(`A new method has been added to Number class.`);
};
