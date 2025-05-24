"use client";

const Paystack = () => {
    const handlePayment =() => {
        const paystack = (window as any).PaystackPop.setup({
            key:"pk_test_c886f4ef66afe2753bdb145a86edf30ae47f1641",
            email:"bbbbbbbbbbbbbbbbbb",
            amount:5000 * 100,
            currency:"NGN",
            ref:`ref-${Date.now()}`,
            callback: function (response:any) {
                alert("Payment successful! Reference:" + response.reference);
                //backend verification of the transaction
            },
            onClose: function() {
                alert("Transaction was cancelled");
            },
        });

        paystack.openIframe();
    };

    return <button onClick={handlePayment}>Pay Now</button>;
};

export default Paystack;