import Collection from '@/component/Collection';

export default function IndexPage() {
  // return <Collection type="model" theme="black" url={urls[2]} />;
  return (
    <div className="canvas-container">
      <Collection type="model" url="/babylon/girl-cartoon.glb" />;
    </div>
  );
}
