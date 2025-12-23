
interface MenuItem {
  title: string;
  links: {
    text: string;
    url: string;
  }[];
}

interface Footer2Props {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  tagline?: string;
  menuItems?: MenuItem[];
  copyright?: string;
  bottomLinks?: {
    text: string;
    url: string;
  }[];
}

const Footer2 = ({
  tagline = "FlashUp.",
  menuItems = [
    {
      title: "Dịch vụ",
      links: [
        { text: "Học Flashcard", url: "#" },
        { text: "Khóa học", url: "#" },
        { text: "Làm đề thi", url: "#" },
      ],
    },
    {
      title: "FlashUp",
      links: [
        { text: "Về chúng tôi", url: "#" },
        { text: "Liên hệ", url: "#" },
        { text: "Quyền riêng tư", url: "#" },
      ],
    },
    {
      title: "Mạng xã hội",
      links: [
        { text: "Facebook", url: "#" },
        { text: "Instagram", url: "#" },
        { text: "LinkedIn", url: "#" },
      ],
    },
  ],
  copyright = "© 2025 flashup. All rights reserved.",
}: Footer2Props) => {
  return (
    <section className="w-full flex justify-center z-20">
      <div className="w-full max-w-6xl bg-gray-100 p-6 rounded-2xl dark:bg-zinc-800">
        <footer>
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-5">
            <div className="col-span-2 mb-8 lg:mb-0">
              <div className="flex items-center gap-2 lg:justify-start">
                
              </div>
              <p className="mt-4 font-bold">{tagline}</p>
            </div>
            {menuItems.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="mb-4 font-bold">{section.title}</h3>
                <ul className="text-muted-foreground space-y-4">
                  {section.links.map((link, linkIdx) => (
                    <li
                      key={linkIdx}
                      className="hover:text-primary font-medium"
                    >
                      <a href={link.url}>{link.text}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="text-muted-foreground flex flex-col justify-start gap-4  pt-8 text-sm font-medium md:flex-row md:items-center">
            <p>{copyright}</p>
          </div>
        </footer>
      </div>
    </section>
  );
};

export { Footer2 };