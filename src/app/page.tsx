import Container from "@/components/Container";

export default function Home() {
  return (
    <Container className="bg-green-500 mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center text-center">
      <div className=" mt-2 mb-4 mx-auto flex max-w-fit items-center space-x-2 overflow-hidden rounded-full  border-gray-200 bg-white px-7 py-2 shadow-md backdrop-blur transition-all hover:border-gray-300 hover:bg-white/50">
        <p className="text-sm font-semibold text-gray-700">sakapdf is now public</p>
      </div>
    </Container>
  )
}
