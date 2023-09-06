import Dashbaord from "@components/components/home/Dashboard";
import LayoutCover from "@components/components/layout/LayoutCover";

export default function Home() {
  return (
    <LayoutCover title={'home | attendance system'}>
      <main>
        <section>
          <Dashbaord />
        </section>
    </main>
    </LayoutCover>
  )
}