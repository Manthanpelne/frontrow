import { auth, signIn, signOut } from "@/auth";

export default async function SignIn() {
  const session = await auth();
  const user = session?.user;
  console.log(user)

  return user ? (
    <>
    <h1>welcome, {user.name}</h1>
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <button className="border text-white bg-red-800 cursor-pointer p-2" type="submit">
          Logout
        </button>
      </form>
    </>
  ) : (
    <>
    <h1>you are not logged in</h1>
      <form
        action={async () => {
          "use server";
          await signIn("google");
        }}
      >
        <button className="border cursor-pointer p-2" type="submit">
          Signin with Google
        </button>
      </form>
    </>
  );
}
