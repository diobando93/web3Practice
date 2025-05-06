import {useForm} from "react-hook-form";
import { Button } from "./ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { ethers } from "ethers";
import { useState } from "react";

export function Transfer() {

  const [tx, setTx] = useState<object | null>(null);

  const form = useForm({
    defaultValues: {
      fromAccount: "0x0cf0A30167070C3e8c3FF6f9d006910df06f78ea",
      toAccount: "0x0424143440c17C5E8892457b1c69dDefe749b25F",
      Amount: 1,
    },

  });

  const onSubmit = async (data : any) => {

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner(data.fromAccount);
    const t = await signer.sendTransaction({
      to: data.toAccount,
      value: ethers.parseEther(data.Amount.toString())
    })
    const tx = await t.wait();
    setTx(tx);
  }

    return <div className="space-y-4 mt-3">
      <h1 className="text-xl font-bold">Transfer</h1>
      <p>Transfer funds between accounts</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8">
          <FormField
            control={form.control}
            name="fromAccount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>From Account</FormLabel>
                <FormControl>
                  <Input placeholder="0xc3445" {...field} />
                </FormControl>
                <FormDescription>Account to transfer from</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="toAccount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>To Account</FormLabel>
                <FormControl>
                  <Input placeholder="0xc3445" {...field} />
                </FormControl>
                <FormDescription>Account to transfer to</FormDescription>
                <FormMessage />
              </FormItem>
            )}/>
          <FormField
            control={form.control}
            name="Amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input placeholder="20" {...field} />
                </FormControl>
                <FormDescription>Quantity</FormDescription>
                <FormMessage />
              </FormItem>
            )}/>


        <Button type="submit">Transfer</Button>    
        </form>
        
      </Form>
      {
        tx && (
          <div>
            <h2>Trasaccion realizada</h2>
            <pre> {JSON.stringify(tx, null, 4)} </pre>
          </div>
        )
      }
      </div>
  }