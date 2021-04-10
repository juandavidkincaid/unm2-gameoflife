import { FC } from "react";

const NamedComponent = <P={}>(displayName: string, component: FC<P>)=>{
    component.displayName = displayName;
    return component;
}

export {
    NamedComponent,
    NamedComponent as NC
}