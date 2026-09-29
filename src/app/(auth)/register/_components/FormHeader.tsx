export default function FormHeader({ title, description }: { title: string; description: string }) {
    return (
        <>
            <h2 className="text-[20px] font-bold text-primary-heading sm:text-[22px]">
                {title}
            </h2>
            <p className="mt-0.5 text-[13px] text-description-text">{description}</p>
        </>
    );
}
