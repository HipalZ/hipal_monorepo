import MemoizedHeader from "@/components/molecules/header";
import { FaArrowLeft, FaTrash } from "react-icons/fa";
import Hi from "@/assets/svg/hi.svg";
import useBusinessData from "@/components/store/useBusinessData";
import { useNavigate } from "react-router-dom";
import { routeToDashboard } from "@/components/utils/routes";
import { memo, useCallback, useMemo } from "react";
import { useDeleteTemplate, useTemplates } from "@/hooks/useTemplates";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import useWhatsapp, { Step } from "@/components/store/useWhatsapp";
import { RiEditFill } from "react-icons/ri";
import { truncateText } from "@/components/utils/helper";

const MemoTemplates = () => {
  const businessData = useBusinessData((s) => s.businessData);
  const { deleteTemplateApi } = useDeleteTemplate();
  const { allTemplatesApi } = useTemplates();
  const navigate = useNavigate();

  const { setTemplateId, setStep, resetTemplateData } = useWhatsapp((s) => ({
    setTemplateId: s.setTemplateId,
    setStep: s.setStep,
    resetTemplateData: s.resetTemplateData,
  }));

  const handleBack = useCallback(() => {
    navigate(routeToDashboard(businessData?._id as string));
  }, [navigate, businessData?._id]);

  // redirecting to create template page and resetting the template data
  const redirectCreateTemplate = useCallback(() => {
    resetTemplateData();
    navigate(`/app/business/${businessData?._id}/template?create=true`);
  }, [navigate, businessData?._id]);

  // edit template navigate
  const handleEditTemplate = useCallback(
    (id: string) => {
      setTemplateId(id);
      setStep(Step.CREATE_EDIT);
      navigate(
        `/app/business/${businessData?._id}/template?edit=true&id=${id}`,
      );
    },
    [navigate, businessData?._id, setTemplateId],
  );

  // delete template call api
  const handleDeleteTemplate = useCallback(async (id: string, name: string) => {
    await deleteTemplateApi(id, name);
  }, []);

  const { headers } = useMemo(() => {
    const headers = ["Name", "Category", "Status", "Sub Category", "Actions"];

    return { headers };
  }, []);

  // get all templates

  const { data: templates, isLoading } = useQuery({
    queryKey: ["getAllTemplates", businessData?._id],
    queryFn: allTemplatesApi,
    enabled: !!businessData?._id,
  });

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="sticky top-0 z-50 w-full linear_gradient_background">
        <MemoizedHeader
          title="WhatzApp"
          onBack={handleBack}
          leftIcon={<FaArrowLeft />}
          rightImage={Hi}
        />
      </div>
      <div className="container p-6 mx-auto my-6 overflow-hidden bg-white rounded-lg shadow-xl sm:p-8">
        <article className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 lg:text-3xl">
            Templates
          </h2>
          <button
            type="button"
            onClick={redirectCreateTemplate}
            className="px-4 py-2 mt-2 text-xs text-white bg-black rounded-lg on_active_button md:text-base on_active_bounce"
          >
            Create Template
          </button>
        </article>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-white shadow-lg bg-gradient-to-r from-blue-400 to-purple-500">
                {headers.map((header) => (
                  <th
                    key={header}
                    className="relative p-4 overflow-hidden font-semibold tracking-wider text-left uppercase group"
                  >
                    <span className="relative z-10">{header}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {isLoading ? (
                <LoadingSpinner />
              ) : templates?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-3 text-center text-gray-500">
                    No Templates Found
                  </td>
                </tr>
              ) : (
                templates?.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`hover:bg-gray-50 transition-colors hover:cursor-pointer ${
                      index % 2 === 0 ? "bg-gray-50" : ""
                    }`}
                  >
                    <td
                      title={row.name}
                      className="p-3 font-medium text-gray-900 border-t"
                    >
                      {truncateText(row.name, 20)}
                    </td>
                    <td className="px-4 border-t">{row.category}</td>
                    <td className="pl-4 border-t">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          row.status === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="p-3 pl-16 text-left border-t">
                      {row.sub_category || "-"}
                    </td>
                    <td className="p-3 border-t">
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => handleEditTemplate(row.id)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          aria-label="Edit template"
                        >
                          <RiEditFill />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTemplate(row.id, row.name)}
                          className="p-1 text-red-600 hover:text-red-800"
                          aria-label="Delete template"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

const Templates = memo(MemoTemplates);
export default Templates;
