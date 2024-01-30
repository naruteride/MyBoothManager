import { defineStore } from "pinia";
import { reactive, ref } from "vue";
import { emptyNumberKeyObject, emptyObject, ErrorCodes, type IAccountUserland, type IBooth, type IBoothCreateRequest, type IBoothMemberAddRequest, type IBoothStatusUpdateRequest, type IBoothUpdateRequest, type IGoods, type IGoodsCategory, type IGoodsCategoryCreateRequest, type IGoodsCategoryUpdateRequest, type IGoodsCombination, type IGoodsCombinationCreateRequest, type IGoodsCombinationUpdateRequest, type IGoodsCreateRequest, type IGoodsOrder, type IGoodsOrderCreateRequest, type IGoodsOrderStatusUpdateRequest, type IGoodsUpdateRequest } from "@myboothmanager/common";
import AdminAPI from "@/lib/api-admin";
import router from "@/plugins/router";
import { useAuthStore } from "./auth";

const useAdminStore = defineStore("admin", () => {
  /* Dependencies (not to be exported) */
  const $authStore = useAuthStore();

  /* States */
  const currentAccount = ref<IAccountUserland | null>(null);
  const currentBoothId = ref<number>(-1);

  const isBoothDataLoaded = ref<boolean>(false);
  const isChangingBooth = ref<boolean>(false);

  const isAPICriticalFetchError = ref<boolean>(false);
  const isAPIFetchError = ref<boolean>(false);
  const apiFetchErrorMessage = ref<string | null>(null);
  const apiFetchErrorCode = ref<ErrorCodes | null>(null);

  const boothList: Record<number, IBooth> = reactive({});
  const boothGoodsCategoryList: Record<number, IGoodsCategory> = reactive({});
  const boothGoodsList: Record<number, IGoods> = reactive({});
  const boothGoodsOrderList: Record<number, IGoodsOrder> = reactive({});
  const boothGoodsCombinationList: Record<number, IGoodsCombination> = reactive({});

  /* Private actions (not to be exported) */
  async function apiWrapper<T>(func: () => Promise<T | ErrorCodes>): Promise<T | ErrorCodes> {
    isAPIFetchError.value = false;
    isAPICriticalFetchError.value = false;
    apiFetchErrorMessage.value = null;
    apiFetchErrorCode.value = null;

    let result;
    try {
      result = await func();
    } catch(err) {
      isAPICriticalFetchError.value = true;
      return ErrorCodes.UNKNOWN_ERROR;
    }

    if(typeof result === "number") {
      /* AUTH RELATED */
      if(result === ErrorCodes.AUTH_TOKEN_NEED_REFRESH) {
        // Try to refresh auth token and retry API call
        const refreshResult = await $authStore.adminAuthRefresh();

        if(typeof refreshResult === "boolean" && refreshResult === true) {
          return await func();
        }
      } else if(result === ErrorCodes.INVALID_AUTH_TOKEN || result === ErrorCodes.NEED_RELOGIN) {
        // Insert further specific actions for these error codes here

        // Force logout
        router.replace({ name: "logout", state: { authTokenInvalid: true } });
        return result;
      }

      /* GENERAL */
      if(result === ErrorCodes.ROUTE_NOT_FOUND) {
        isAPIFetchError.value = true;
        apiFetchErrorMessage.value = "요청한 API를 찾을 수 없습니다.";
        apiFetchErrorCode.value = result;
      }
    }

    return result;
  }

  /* Actions */
  function invalidateAllStates(): void {
    currentAccount.value = null;
    currentBoothId.value = -1;

    isBoothDataLoaded.value = false;
    isChangingBooth.value = false;

    emptyNumberKeyObject(boothList);
    emptyNumberKeyObject(boothGoodsCategoryList);
    emptyNumberKeyObject(boothGoodsList);
    emptyNumberKeyObject(boothGoodsOrderList);
  }

  function changeBooth(boothId: number): void {
    isChangingBooth.value = true;
    currentBoothId.value = boothId;
    clearAllBoothData(false);

    isBoothDataLoaded.value = false;
  }

  function changeBoothToFirst(): void {
    isChangingBooth.value = true;
    currentBoothId.value = Object.keys(boothList).length > 0 ? parseInt(Object.keys(boothList)[0]) : -1;
    clearAllBoothData(false);

    isBoothDataLoaded.value = false;
  }

  async function fetchCurrentAccountInfo(): Promise<boolean | ErrorCodes> {
    const response = await apiWrapper(() => AdminAPI.fetchCurrentAccountInfo());

    if(response && response instanceof Object) {
      currentAccount.value = response;
      return true;
    } else {
      return response;
    }
  }

  async function fetchBoothsOfCurrentAccount(setFirstBoothAsCurrent: boolean = false): Promise<boolean | ErrorCodes> {
    const response = await apiWrapper(() => AdminAPI.fetchAllBooths());

    if(response && response instanceof Array) {
      if(setFirstBoothAsCurrent) {
        currentBoothId.value = response.length > 0 ? response[0].id : -1;
      }

      for(const booth of response) {
        boothList[booth.id] = booth;
      }
      return true;
    } else {
      return response;
    }
  }

  async function fetchGoodsCategoriesOfCurrentBooth(refresh: boolean = false): Promise<boolean | ErrorCodes> {
    if(currentBoothId.value === -1) return false;

    const response = await apiWrapper(() => AdminAPI.fetchAllGoodsCategoriesOfBooth(currentBoothId.value));

    if(response && response instanceof Array) {
      if(refresh) emptyObject(boothGoodsCategoryList);

      for(const category of response) {
        boothGoodsCategoryList[category.id] = category;
      }
      return true;
    } else {
      return response;
    }
  }

  async function fetchGoodsOfCurrentBooth(refresh: boolean = false): Promise<boolean | ErrorCodes> {
    if(currentBoothId.value === -1) return false;

    const response = await apiWrapper(() => AdminAPI.fetchAllGoodsOfBooth(currentBoothId.value));

    if(response && response instanceof Array) {
      if(refresh) emptyObject(boothGoodsList);

      for(const goods of response) {
        boothGoodsList[goods.id] = goods;
      }
      return true;
    } else {
      return response;
    }
  }

  async function fetchGoodsOrdersOfCurrentBooth(refresh: boolean = false): Promise<boolean | ErrorCodes> {
    if(currentBoothId.value === -1) return false;

    const response = await apiWrapper(() => AdminAPI.fetchAllGoodsOrdersOfBooth(currentBoothId.value));

    if(response && response instanceof Array) {
      if(refresh) emptyObject(boothGoodsList);

      for(const order of response) {
        boothGoodsOrderList[order.id] = order;
      }
      return true;
    } else {
      return response;
    }
  }

  async function fetchGoodsCombinationOfCurrentBooth(refresh: boolean = false): Promise<boolean | ErrorCodes> {
    if(currentBoothId.value === -1) return false;

    const response = await apiWrapper(() => AdminAPI.fetchAllGoodsCombinationOfBooth(currentBoothId.value));

    if(response && response instanceof Array) {
      if(refresh) emptyObject(boothGoodsCombinationList);

      for(const combination of response) {
        boothGoodsCombinationList[combination.id] = combination;
      }
      return true;
    } else {
      return response;
    }
  }

  async function createBooth(payload: IBoothCreateRequest): Promise<boolean | ErrorCodes> {
    const response = await apiWrapper(() => AdminAPI.createBooth(payload));

    if(response && response instanceof Object) {
      boothList[response.id] = response;
      return true;
    } else {
      return response;
    }
  }

  async function addBoothMember(payload: IBoothMemberAddRequest): Promise<boolean | ErrorCodes> {
    const response = await apiWrapper(() => AdminAPI.addBoothMember(currentBoothId.value, payload));

    if(response && response instanceof Object) {
      if(!boothList[currentBoothId.value].members) boothList[currentBoothId.value].members = [];

      boothList[currentBoothId.value].members.splice(0, boothList[currentBoothId.value].members.length, ...response.members);
      return true;
    } else {
      return response;
    }
  }

  async function uploadBoothBannerImage(payload: File | Blob): Promise<boolean | ErrorCodes> {
    const response = await apiWrapper(() => AdminAPI.uploadBoothBannerImage(currentBoothId.value, payload));

    if(response && response instanceof Object) {
      if(typeof response.value === "string") {
        boothList[currentBoothId.value].bannerImageUrl = response.value;
        return true;
      } else {
        return false;
      }
    } else {
      return response;
    }
  }

  async function uploadBoothInfoImage(payload: File | Blob): Promise<boolean | ErrorCodes> {
    const response = await apiWrapper(() => AdminAPI.uploadBoothInfoImage(currentBoothId.value, payload));

    if(response && response instanceof Object) {
      if(typeof response.value === "string") {
        boothList[currentBoothId.value].infoImageUrl = response.value;
        return true;
      } else {
        return false;
      }
    } else {
      return response;
    }
  }

  async function uploadBoothMemberImage(memberUuid: string, payload: File | Blob): Promise<boolean | ErrorCodes> {
    const response = await apiWrapper(() => AdminAPI.uploadBoothMemberImage(currentBoothId.value, memberUuid, payload));

    if(response && response instanceof Object) {
      if(typeof response.value === "string") {
        const member = boothList[currentBoothId.value].members.find((member) => member.uuid === memberUuid);
        if(!member) return false;

        member.memberImageUrl = response.value;
        return true;
      } else {
        return false;
      }
    } else {
      return response;
    }
  }

  async function uploadGoodsImage(goodsId: number, payload: File | Blob): Promise<boolean | ErrorCodes> {
    const response = await apiWrapper(() => AdminAPI.uploadGoodsImage(goodsId, currentBoothId.value, payload));

    if(response && response instanceof Object) {
      if(typeof response.value === "string") {
        boothGoodsList[goodsId].goodsImageUrl = response.value;
        return true;
      } else {
        return false;
      }
    } else {
      return response;
    }
  }

  async function uploadGoodsCombinationImage(combinationId: number, payload: File | Blob): Promise<boolean | ErrorCodes> {
    const response = await apiWrapper(() => AdminAPI.uploadGoodsCombinationImage(combinationId, currentBoothId.value, payload));

    if(response && response instanceof Object) {
      if(typeof response.value === "string") {
        boothGoodsCombinationList[combinationId].combinationImageUrl = response.value;
        return true;
      } else {
        return false;
      }
    } else {
      return response;
    }
  }

  async function createGoods(payload: IGoodsCreateRequest): Promise<boolean | ErrorCodes> {
    const response = await apiWrapper(() => AdminAPI.createGoods(payload));

    if(response && response instanceof Object) {
      boothGoodsList[response.id] = response;
      return true;
    } else {
      return response;
    }
  }

  async function createGoodsCategory(payload: IGoodsCategoryCreateRequest): Promise<{ id: number } | ErrorCodes> {
    const response = await apiWrapper(() => AdminAPI.createGoodsCategory(payload));

    if(response && response instanceof Object) {
      boothGoodsCategoryList[response.id] = response;
      return { id: response.id };
    } else {
      return response;
    }
  }

  async function createGoodsOrder(payload: IGoodsOrderCreateRequest): Promise<boolean | ErrorCodes> {
    const response = await apiWrapper(() => AdminAPI.createGoodsOrder(payload));

    if(response && response instanceof Object) {
      // Nothing will be added to any list
      return true;
    } else {
      return response;
    }
  }

  async function createGoodsCombination(payload: IGoodsCombinationCreateRequest): Promise<boolean | ErrorCodes> {
    const response = await apiWrapper(() => AdminAPI.createGoodsCombination(payload));

    if(response && response instanceof Object) {
      boothGoodsCombinationList[response.id] = response;
      return await fetchGoodsOfCurrentBooth(true);
    } else {
      return response;
    }
  }

  async function updateGoodsInfo(goodsId: number, payload: IGoodsUpdateRequest): Promise<boolean | ErrorCodes> {
    const response = await apiWrapper(() => AdminAPI.updateGoodsInfo(goodsId, payload));

    if(response && response instanceof Object) {
      boothGoodsList[goodsId] = {
        ...boothGoodsList[goodsId],
        ...response,
      };

      if(response.combinationId) {
        return await fetchGoodsCombinationOfCurrentBooth(true);
      } else {
        return true;
      }
    } else {
      return response;
    }
  }

  async function updateGoodsCategoryInfo(categoryId: number, payload: IGoodsCategoryUpdateRequest): Promise<{ id: number } | ErrorCodes> {
    const response = await apiWrapper(() => AdminAPI.updateGoodsCategoryInfo(categoryId, payload));

    if(response && response instanceof Object) {
      boothGoodsCategoryList[categoryId] = {
        ...boothGoodsCategoryList[categoryId],
        ...response,
      };
      return { id: response.id };
    } else {
      return response;
    }
  }

  async function updateGoodsCombinationInfo(combinationId: number, payload: IGoodsCombinationUpdateRequest): Promise<boolean | ErrorCodes> {
    const response = await apiWrapper(() => AdminAPI.updateGoodsCombinationInfo(combinationId, payload));

    if(response && response instanceof Object) {
      boothGoodsCombinationList[combinationId] = { ...response };
      return await fetchGoodsOfCurrentBooth(true);
    } else {
      return response;
    }
  }

  async function updateCurrentBoothInfo(payload: IBoothUpdateRequest): Promise<boolean | ErrorCodes> {
    const response = await apiWrapper(() => AdminAPI.updateBoothInfo(currentBoothId.value, payload));

    if(response && response instanceof Object) {
      boothList[currentBoothId.value] = {
        ...boothList[currentBoothId.value],
        ...response,
      };
      return true;
    } else {
      return response;
    }
  }

  async function updateCurrentBoothStatus(payload: IBoothStatusUpdateRequest): Promise<boolean | ErrorCodes> {
    const response = await apiWrapper(() => AdminAPI.updateBoothStatus(currentBoothId.value, payload));

    if(response && response instanceof Object) {
      boothList[currentBoothId.value] = {
        ...boothList[currentBoothId.value],
        ...payload,
      };
      return true;
    } else {
      return response;
    }
  }

  async function updateGoodsOrderStatus(orderId: number, payload: IGoodsOrderStatusUpdateRequest): Promise<boolean | ErrorCodes> {
    const response = await apiWrapper(() => AdminAPI.updateGoodsOrderStatus(orderId, currentBoothId.value, payload));

    if(response && response instanceof Object) {
      boothGoodsOrderList[orderId] = {
        ...boothGoodsOrderList[orderId],
        ...payload,
      };

      await fetchGoodsOfCurrentBooth(true);

      return true;
    } else {
      return response;
    }
  }

  async function deleteBoothBannerImage(): Promise<boolean | ErrorCodes> {
    const response = await apiWrapper(() => AdminAPI.deleteBoothBannerImage(currentBoothId.value));

    if(response && response instanceof Object) {
      delete boothList[currentBoothId.value].bannerImageUrl;
      return true;
    } else {
      return response;
    }
  }

  async function deleteBoothInfoImage(): Promise<boolean | ErrorCodes> {
    const response = await apiWrapper(() => AdminAPI.deleteBoothInfoImage(currentBoothId.value));

    if(response && response instanceof Object) {
      delete boothList[currentBoothId.value].infoImageUrl;
      return true;
    } else {
      return response;
    }
  }

  async function deleteBoothMember(memberUuid: string): Promise<boolean | ErrorCodes> {
    const response = await apiWrapper(() => AdminAPI.deleteBoothMember(currentBoothId.value, memberUuid));

    if(response && response instanceof Object) {
      boothList[currentBoothId.value].members.splice(
        boothList[currentBoothId.value].members.findIndex((member) => member.uuid === memberUuid),
        1,
      );
      return true;
    } else {
      return response;
    }
  }

  async function deleteBoothMemberImage(memberUuid: string): Promise<boolean | ErrorCodes> {
    const response = await apiWrapper(() => AdminAPI.deleteBoothMemberImage(currentBoothId.value, memberUuid));

    if(response && response instanceof Object) {
      const member = boothList[currentBoothId.value].members.find((member) => member.uuid === memberUuid);
      if(!member) return false;

      delete member.memberImageUrl;
      return true;
    } else {
      return response;
    }
  }

  async function deleteGoodsImage(goodsId: number): Promise<boolean | ErrorCodes> {
    const response = await apiWrapper(() => AdminAPI.deleteGoodsImage(goodsId, currentBoothId.value));

    if(response && response instanceof Object) {
      delete boothGoodsList[goodsId].goodsImageUrl;
      return true;
    } else {
      return response;
    }
  }

  async function deleteGoodsCombinationImage(combinationId: number): Promise<boolean | ErrorCodes> {
    const response = await apiWrapper(() => AdminAPI.deleteGoodsCombinationImage(combinationId, currentBoothId.value));

    if(response && response instanceof Object) {
      delete boothGoodsCombinationList[combinationId].combinationImageUrl;
      return true;
    } else {
      return response;
    }
  }

  async function deleteGoods(goodsId: number): Promise<boolean | ErrorCodes> {
    const response = await apiWrapper(() => AdminAPI.deleteGoods(goodsId, currentBoothId.value));

    if(response && response instanceof Object) {
      // Force fetch goods
      const results = [
        await fetchGoodsOfCurrentBooth(true),
        await fetchGoodsCombinationOfCurrentBooth(true),
      ];

      return results.every((s) => typeof s === "boolean" && s === true);
    } else {
      return response;
    }
  }

  async function deleteGoodsCategory(categoryId: number): Promise<boolean | ErrorCodes> {
    const response = await apiWrapper(() => AdminAPI.deleteGoodsCategory(categoryId));

    if(response && response instanceof Object) {
      // Force fetch goods & goods categories
      const results = [
        await fetchGoodsOfCurrentBooth(true),
        await fetchGoodsCategoriesOfCurrentBooth(true),
        await fetchGoodsCombinationOfCurrentBooth(true),
      ];

      return results.every((s) => typeof s === "boolean" && s === true);
    } else {
      return response;
    }
  }

  async function deleteGoodsCombination(combinationId: number): Promise<boolean | ErrorCodes> {
    const response = await apiWrapper(() => AdminAPI.deleteGoodsCombination(combinationId, currentBoothId.value));

    if(response && response instanceof Object) {
      // Force fetch goods combinations
      const results = [
        await fetchGoodsOfCurrentBooth(true),
        await fetchGoodsCombinationOfCurrentBooth(true),
      ];

      return results.every((s) => typeof s === "boolean" && s === true);
    } else {
      return response;
    }
  }

  function clearAllBoothData(includeBoothList: boolean = true): void {
    if(includeBoothList) emptyNumberKeyObject(boothList);

    emptyNumberKeyObject(boothGoodsList);
    emptyNumberKeyObject(boothGoodsCategoryList);
    emptyNumberKeyObject(boothGoodsCombinationList);
    emptyNumberKeyObject(boothGoodsOrderList);
  }

  async function fetchAllBoothData(startup: boolean = true): Promise<boolean> {
    const responses = [];
    if(startup && !isChangingBooth.value) {
      responses.push(await fetchBoothsOfCurrentAccount(true));
    }

    responses.push(
      await fetchGoodsCategoriesOfCurrentBooth(),
      await fetchGoodsCombinationOfCurrentBooth(),
      await fetchGoodsOfCurrentBooth(),
    );

    isChangingBooth.value = false;
    if(responses.every((s) => typeof s !== "string")) {
      isBoothDataLoaded.value = true;
      return true;
    } else {
      return false;
    }
  }

  return {
    currentAccount,
    currentBoothId,
    isBoothDataLoaded,
    isChangingBooth,
    isAPICriticalFetchError,
    isAPIFetchError,
    apiFetchErrorMessage,
    apiFetchErrorCode,

    boothList,
    boothGoodsCategoryList,
    boothGoodsList,
    boothGoodsOrderList,
    boothGoodsCombinationList,

    invalidateAllStates,
    changeBooth,
    changeBoothToFirst,
    fetchCurrentAccountInfo,
    fetchBoothsOfCurrentAccount,
    fetchGoodsCategoriesOfCurrentBooth,
    fetchGoodsOfCurrentBooth,
    fetchGoodsOrdersOfCurrentBooth,
    fetchGoodsCombinationOfCurrentBooth,
    updateGoodsInfo,
    updateGoodsCategoryInfo,
    updateCurrentBoothInfo,
    updateGoodsCombinationInfo,
    updateCurrentBoothStatus,
    updateGoodsOrderStatus,
    createBooth,
    addBoothMember,
    createGoods,
    createGoodsCategory,
    createGoodsOrder,
    createGoodsCombination,
    uploadBoothBannerImage,
    uploadBoothInfoImage,
    uploadBoothMemberImage,
    uploadGoodsImage,
    uploadGoodsCombinationImage,
    deleteBoothBannerImage,
    deleteBoothInfoImage,
    deleteBoothMember,
    deleteBoothMemberImage,
    deleteGoodsImage,
    deleteGoodsCombinationImage,
    deleteGoods,
    deleteGoodsCategory,
    deleteGoodsCombination,
    clearAllBoothData,
    fetchAllBoothData,
  };
});

export { useAdminStore };
